import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import path from 'path';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const firebaseApp = initializeApp();
const db = getFirestore(firebaseApp);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Argentina/Buenos_Aires';

app.use(express.json());
app.use(cookieParser());

const getStripe = async (salonId: string) => {
  try {
    const doc = await db.collection('salons').doc(salonId).get();
    const data = doc.data();
    const secretKey = data?.payments?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

    if (!secretKey) return null;
    return new Stripe(secretKey);
  } catch (error) {
    console.error('Error getting Stripe client:', error);
    return null;
  }
};

const getMP = async (salonId: string) => {
  try {
    const doc = await db.collection('salons').doc(salonId).get();
    const data = doc.data();
    const accessToken = data?.payments?.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) return null;
    return new MercadoPagoConfig({ accessToken });
  } catch (error) {
    console.error('Error getting MP client:', error);
    return null;
  }
};

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${APP_URL}/auth/google/callback`,
);

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

app.get('/api/auth/google/url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  res.json({ url });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code as string);

    if (state) {
      await db.collection('salons').doc(state as string).update({
        googleCalendarTokens: JSON.stringify(tokens),
      });
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Error de autenticación');
  }
});

app.get('/api/auth/google/status', async (req, res) => {
  const { salonId } = req.query;

  if (!salonId) {
    return res.json({ connected: false });
  }

  try {
    const doc = await db.collection('salons').doc(salonId as string).get();
    const data = doc.data();

    return res.json({ connected: !!data?.googleCalendarTokens });
  } catch (error) {
    return res.json({ connected: false });
  }
});

app.post('/api/calendar/event', async (req, res) => {
  const { salonId, summary, description, start, end } = req.body;

  if (!salonId) {
    return res.status(400).json({ error: 'salonId requerido' });
  }

  try {
    const doc = await db.collection('salons').doc(salonId).get();
    const data = doc.data();
    const tokensStr = data?.googleCalendarTokens;

    if (!tokensStr) {
      return res.status(401).json({ error: 'No conectado a Google Calendar' });
    }

    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: start, timeZone: APP_TIMEZONE },
        end: { dateTime: end, timeZone: APP_TIMEZONE },
      },
    });

    return res.json(event.data);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return res.status(500).json({ error: 'Error al crear el evento en el calendario' });
  }
});

app.post('/api/payments/stripe/create-checkout-session', async (req, res) => {
  const { appointmentId, amount, serviceName, clientEmail, salonId } = req.body;

  if (!salonId) {
    return res.status(400).json({ error: 'salonId requerido' });
  }

  const stripe = await getStripe(salonId);

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe no está configurado para este salón' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Turno: ${serviceName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/agenda?payment=success&id=${appointmentId}`,
      cancel_url: `${APP_URL}/agenda?payment=cancel`,
      customer_email: clientEmail,
      metadata: { appointmentId, salonId },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({ error: 'Error al crear sesión de pago' });
  }
});

app.post('/api/payments/mercadopago/create-preference', async (req, res) => {
  const { appointmentId, amount, serviceName, salonId } = req.body;

  if (!salonId) {
    return res.status(400).json({ error: 'salonId requerido' });
  }

  const client = await getMP(salonId);

  if (!client) {
    return res.status(500).json({ error: 'Mercado Pago no está configurado para este salón' });
  }

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: appointmentId,
            title: `Turno: ${serviceName}`,
            quantity: 1,
            unit_price: Number(amount),
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${APP_URL}/agenda?payment=success&id=${appointmentId}`,
          failure: `${APP_URL}/agenda?payment=failure`,
          pending: `${APP_URL}/agenda?payment=pending`,
        },
        auto_return: 'approved',
        metadata: { appointmentId, salonId },
      },
    });

    return res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

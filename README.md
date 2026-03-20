# Beauty CRM Template

Plantilla pública para un CRM/ERP liviano de estudios de belleza, pensada para lashes, uñas, micropigmentación y servicios similares.

## Qué incluye

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4
- Firebase Auth + Firestore
- Express como servidor local/full-stack
- Integración opcional con Google Calendar
- Integración opcional con Stripe y Mercado Pago
- UI responsive con dashboard, agenda, reservas, clientas, servicios, caja y configuración

## Estado del template

Este repositorio fue preparado para publicarse como base reusable:

- sin datos reales de clientas
- sin branding privado
- sin referencias al proyecto original de Firebase / AI Studio
- con configuración movida a variables de entorno

## Puesta en marcha

### 1) Instalar dependencias

```bash
npm install
```

### 2) Crear el archivo de entorno

Copiá `.env.example` a `.env` y completá al menos la configuración de Firebase Web:

```bash
cp .env.example .env
```

### 3) Iniciar en desarrollo

```bash
npm run dev
```

La app corre sobre `http://localhost:3000`.

## Variables de entorno

### Requeridas para login y datos
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Opcionales
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_ID`
- `APP_URL`
- `APP_TIMEZONE`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `STRIPE_SECRET_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `GOOGLE_APPLICATION_CREDENTIALS`

## Firebase Admin en local

Las rutas server-side (Google Calendar, Stripe, Mercado Pago y lectura/escritura vía admin) funcionan mejor si configurás credenciales de servicio para Firebase Admin con `GOOGLE_APPLICATION_CREDENTIALS`.

## Estructura principal

```text
src/
  components/
  App.tsx
  firebase.ts
  index.css
  types.ts
server.ts
firestore.rules
```

## Qué conviene personalizar primero

- nombre y branding del estudio
- servicios y categorías
- paleta visual
- reglas de Firestore
- integraciones de pagos
- copy de pantallas y mensajes

## Sugerencias para publicarlo en GitHub

- Cambiá el nombre del repo por algo tipo `beauty-crm-template`
- Agregá una licencia (MIT, Apache-2.0, GPL, etc.)
- Sumá screenshots cuando tengas una versión estable
- Documentá qué módulos están terminados y cuáles están en roadmap

## Nota

La plantilla mantiene la estética y estructura del proyecto original, pero los datos demo, configuraciones y referencias privadas fueron saneadas para publicación pública.

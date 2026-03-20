import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from './UI';
import { Calendar, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { auth } from '../firebase';

const Reservas: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;
  const [bookingData, setBookingData] = useState({
    summary: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
  });

  useEffect(() => {
    if (user) {
      checkAuthStatus();
    }
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsConnected(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkAuthStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/auth/google/status?salonId=${user.uid}`);
      const data = await res.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      // Add state (salonId) to the URL
      const urlWithState = `${url}&state=${user.uid}`;
      window.open(urlWithState, 'google_oauth', 'width=600,height=700');
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const start = `${bookingData.date}T${bookingData.time}:00`;
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + parseInt(bookingData.duration) * 60000);
    const end = endDate.toISOString().split('.')[0];

    try {
      const res = await fetch('/api/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: user.uid,
          summary: bookingData.summary,
          description: bookingData.description,
          start,
          end,
        }),
      });

      if (res.ok) {
        alert('Reserva creada con éxito en Google Calendar');
        setBookingData({
          summary: '',
          description: '',
          date: '',
          time: '',
          duration: '60',
        });
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-brand-taupe dark:text-white">Reservas Online</h2>
          <p className="text-brand-taupe/50 dark:text-white/50 text-xs sm:text-sm">Gestioná tus reservas y sincronizalas con Google Calendar.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          <Card className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-rose/10 text-brand-rose">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-brand-taupe dark:text-white">Google Calendar</h3>
            </div>
            
            <p className="text-xs sm:text-sm text-brand-taupe/60 dark:text-white/40">
              Conectá tu cuenta para que cada reserva se cree automáticamente como un evento en tu calendario.
            </p>

            {isConnected ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 p-2.5 sm:p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                  <Check className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Conectado</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsConnected(false)} className="text-rose-500 border-rose-200 hover:bg-rose-50 text-xs">
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} icon={ExternalLink} className="w-full text-sm">
                Conectar con Google
              </Button>
            )}
          </Card>

          <Card className="bg-brand-blush/20 dark:bg-white/5 border-none p-4">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-brand-rose mt-0.5 shrink-0" />
              <p className="text-[11px] sm:text-xs text-brand-taupe/60 dark:text-white/40 leading-relaxed">
                Asegurate de tener configurada la zona horaria correcta en tu cuenta de Google para evitar errores en las citas.
              </p>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2 flex flex-col gap-6 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-brand-taupe dark:text-white">Nueva Reserva</h3>
          <form onSubmit={handleBooking} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input 
                label="Servicio / Título" 
                placeholder="Ej: Extensiones de Pestañas"
                value={bookingData.summary}
                onChange={(e) => setBookingData({...bookingData, summary: e.target.value})}
                required
                className="text-sm"
              />
              <Input 
                label="Duración (minutos)" 
                type="number"
                value={bookingData.duration}
                onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                required
                className="text-sm"
              />
              <Input 
                label="Fecha" 
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                required
                className="text-sm"
              />
              <Input 
                label="Hora" 
                type="time"
                value={bookingData.time}
                onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                required
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-brand-taupe/60 dark:text-white/40 uppercase tracking-wider ml-1">Notas / Descripción</label>
              <textarea 
                className="bg-brand-ivory/50 dark:bg-dark-silver/30 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 dark:focus:ring-white/10 transition-all min-h-[100px]"
                placeholder="Detalles adicionales de la clienta..."
                value={bookingData.description}
                onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!isConnected || loading} 
              className="w-full md:w-auto md:self-end text-sm"
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </Button>
            {!isConnected && (
              <p className="text-[9px] sm:text-[10px] text-brand-rose font-bold text-center md:text-right">
                * Debes conectar tu cuenta de Google para crear reservas.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Reservas;

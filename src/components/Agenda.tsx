import React, { useState, useMemo, useEffect } from 'react';
import { Card, Badge, Button, Input } from './UI';
import { 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  MoreHorizontal,
  Check,
  X,
  Calendar as CalendarIcon,
  User,
  Sparkles,
  MapPin,
  AlertCircle,
  CalendarDays,
  CreditCard,
  Wallet as WalletIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_APPOINTMENTS, Appointment, MOCK_CLIENTS, MOCK_SERVICES } from '../types';
import { auth } from '../firebase';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const Agenda: React.FC = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 2, 20)); // March 20, 2026
  const [viewMonth, setViewMonth] = useState<Date>(new Date(2026, 2, 1)); // March 2026
  const [showDayModal, setShowDayModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [isNewClient, setIsNewClient] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Handle payment response from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const appointmentId = params.get('id');

    if (paymentStatus === 'success' && appointmentId) {
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, paymentStatus: 'paid', paidAmount: apt.totalAmount } 
          : apt
      ));
      alert('¡Pago realizado con éxito!');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStripePayment = async (apt: Appointment) => {
    const salonId = auth.currentUser?.uid;
    if (!salonId) {
      alert('Debes estar autenticado para procesar pagos.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: apt.id,
          amount: apt.totalAmount,
          serviceName: apt.serviceName,
          clientEmail: 'cliente@ejemplo.com',
          salonId,
        }),
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (error) {
      console.error('Stripe error:', error);
      alert(error instanceof Error ? error.message : 'Error al iniciar pago con Stripe');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleMPPayment = async (apt: Appointment) => {
    const salonId = auth.currentUser?.uid;
    if (!salonId) {
      alert('Debes estar autenticado para procesar pagos.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/payments/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: apt.id,
          amount: apt.totalAmount,
          serviceName: apt.serviceName,
          salonId,
        }),
      });
      const { init_point, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = init_point;
    } catch (error) {
      console.error('Mercado Pago error:', error);
      alert(error instanceof Error ? error.message : 'Error al iniciar pago con Mercado Pago');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9 AM to 8 PM

  const monthName = viewMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  
  const daysInMonth = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const result = [];
    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    for (let i = 1; i <= days; i++) {
      result.push(new Date(year, month, i));
    }
    return result;
  }, [viewMonth]);

  const appointmentsForSelectedDate = useMemo(() => {
    const dateStr = formatDate(selectedDate);
    return appointments.filter(apt => apt.date === dateStr);
  }, [selectedDate, appointments]);

  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalDate(date);
    setShowDayModal(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return appointments.filter(apt => apt.date === dateStr);
  };

  const handleCreateAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const serviceId = formData.get('serviceId') as string;
    const service = MOCK_SERVICES.find(s => s.id === serviceId);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;

    if (!service) return;

    // Business Hours Validation (Simple check for now, can be expanded with config)
    const hour = parseInt(time.split(':')[0]);
    if (hour < 9 || hour >= 20) {
      alert('El salón está cerrado a esa hora. Por favor, elegí un horario entre las 09:00 y las 20:00.');
      return;
    }

    // Overlap Validation
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    const hasOverlap = appointments.some(apt => {
      if (apt.date !== date) return false;
      const aptStart = new Date(`${apt.date}T${apt.time}`);
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
      return (startTime < aptEnd && endTime > aptStart);
    });

    if (hasOverlap) {
      alert('Ya hay un turno agendado en ese horario. Por favor, elegí otro momento.');
      return;
    }

    let client;
    if (isNewClient) {
      const newClientName = formData.get('newClientName') as string;
      const newClientPhone = formData.get('newClientPhone') as string;
      if (!newClientName) return;
      
      client = {
        id: `c${Date.now()}`,
        name: newClientName,
        phone: newClientPhone,
        status: 'new' as const,
        totalSpent: 0,
      };
      setClients([...clients, client]);
    } else {
      const clientId = formData.get('clientId') as string;
      client = clients.find(c => c.id === clientId);
    }

    if (!client) return;

    const newAppointment: Appointment = {
      id: `a${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      serviceId: service.id,
      serviceName: service.name,
      date,
      time,
      duration: service.duration,
      status: 'confirmed',
      paymentStatus: 'pending',
      totalAmount: service.price,
      paidAmount: 0,
    };

    setAppointments([...appointments, newAppointment]);
    setShowNewAppointmentModal(false);
    setIsNewClient(false);
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif italic text-brand-taupe dark:text-white">Agenda</h2>
          <p className="text-brand-taupe/50 dark:text-white/50 text-xs lg:text-sm">Organizá tus turnos y bloqueos de tiempo.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="bg-white dark:bg-dark-silver/50 rounded-full p-1 flex gap-1 premium-shadow self-start sm:self-auto">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 lg:px-4 py-1.5 rounded-full text-[10px] lg:text-xs font-medium transition-all ${view === v ? 'bg-brand-rose text-white' : 'text-brand-taupe/40 dark:text-white/40 hover:text-brand-taupe dark:hover:text-white'}`}
              >
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <Button 
            icon={Plus} 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            Nuevo Turno
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Mini Calendar & Filters - Now Above Timeline */}
        <Card className="p-6 lg:p-10 dark:bg-dark-card border-brand-rose/10 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8 lg:mb-10">
                <h4 className="text-2xl lg:text-3xl font-serif italic text-brand-taupe dark:text-white capitalize">{monthName}</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-3 hover:bg-brand-blush/50 dark:hover:bg-white/5 rounded-2xl text-brand-taupe dark:text-white transition-all border border-brand-rose/5 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-3 hover:bg-brand-blush/50 dark:hover:bg-white/5 rounded-2xl text-brand-taupe dark:text-white transition-all border border-brand-rose/5 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 lg:gap-3 text-center mb-6 lg:mb-8">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                  <span key={`${d}-${i}`} className="text-[10px] lg:text-[12px] font-bold text-brand-taupe/40 dark:text-white/30 uppercase tracking-widest">{d}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2 lg:gap-3 text-center">
                {daysInMonth.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const apts = getAppointmentsForDate(date);
                  const hasApts = apts.length > 0;
                  
                  return (
                    <button 
                      key={date.toISOString()} 
                      onClick={() => handleDayClick(date)}
                      className={`
                        relative aspect-square flex flex-col items-center justify-center text-sm lg:text-base rounded-xl lg:rounded-2xl transition-all font-semibold
                        ${isSelected(date) 
                          ? 'bg-brand-rose text-white shadow-lg shadow-rose-500/20 scale-105' 
                          : 'hover:bg-brand-blush/50 dark:hover:bg-white/5 text-brand-taupe dark:text-white/90'}
                      `}
                    >
                      {date.getDate()}
                      {hasApts && !isSelected(date) && (
                        <div className="absolute bottom-1.5 lg:bottom-2 w-1 h-1 rounded-full bg-brand-rose" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-brand-rose/10 dark:border-white/10 pt-8 lg:pt-0 lg:pl-10">
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <div className="p-3 bg-brand-rose/10 rounded-2xl">
                  <Filter className="w-5 h-5 text-brand-rose" />
                </div>
                <h4 className="text-xs lg:text-sm font-bold text-brand-taupe dark:text-white uppercase tracking-widest">Filtrar Servicios</h4>
              </div>
              
              <div className="flex flex-row lg:flex-col flex-wrap gap-4 lg:gap-5">
                {['Pestañas', 'Uñas', 'Micropigmentación'].map(cat => (
                  <label key={cat} className="flex items-center gap-3 lg:gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-xl border-2 border-brand-rose/20 dark:border-white/10 peer-checked:bg-brand-rose peer-checked:border-brand-rose transition-all shadow-sm group-hover:border-brand-rose/40" />
                      <Check className="absolute w-4 h-4 lg:w-5 lg:h-5 text-white opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100" />
                    </div>
                    <span className="text-sm lg:text-base text-brand-taupe/70 dark:text-white/50 group-hover:text-brand-taupe dark:group-hover:text-white transition-colors font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline View */}
        <Card className="w-full p-0 overflow-hidden dark:bg-dark-card border-brand-rose/10 shadow-2xl">
          <div className="p-5 lg:p-8 border-b border-brand-rose/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-ivory/30 dark:bg-white/5 gap-4">
            <div className="flex items-center gap-4 lg:gap-6">
              <h3 className="text-base lg:text-xl font-semibold text-brand-taupe dark:text-white capitalize">
                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {isToday(selectedDate) && <Badge variant="success" className="text-[10px] lg:text-xs">Hoy</Badge>}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                icon={CalendarIcon} 
                className="text-[10px] lg:text-xs flex-1 sm:flex-none"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
              >
                Ir a hoy
              </Button>
            </div>
          </div>

          <div className="relative h-[700px] lg:h-[900px] overflow-y-auto p-5 lg:p-8 scroll-smooth bg-white/50 dark:bg-transparent">
            {/* Time markers */}
            <div className="absolute left-5 lg:left-8 right-5 lg:right-8 top-5 lg:top-8 bottom-5 lg:bottom-8 flex flex-col pointer-events-none">
              {hours.map((h, i) => (
                <div key={h} className="relative flex items-start gap-5 w-full" style={{ height: '140px' }}>
                  <span className="text-[11px] lg:text-[13px] font-bold text-brand-taupe/30 dark:text-white/20 w-10 lg:w-12 -mt-2">{h}:00</span>
                  <div className="h-[1px] flex-1 bg-brand-rose/10 dark:bg-white/5 mt-0" />
                  {/* Half hour line */}
                  <div className="absolute left-14 lg:left-16 right-0 top-[70px] h-[1px] bg-brand-rose/[0.03] dark:bg-white/[0.02] border-dashed border-t" />
                </div>
              ))}
            </div>

            {/* Appointments */}
            <div className="relative ml-12 lg:ml-16 h-[1680px]">
              {appointmentsForSelectedDate.length > 0 ? (
                appointmentsForSelectedDate.map((apt, idx) => {
                  const startHour = parseInt(apt.time.split(':')[0]);
                  const startMin = parseInt(apt.time.split(':')[1]);
                  const topPosition = ((startHour - 9) * 140) + (startMin / 60 * 140);
                  const height = (apt.duration / 60) * 140;

                  const statusColors = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                    rescheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
                    'in-progress': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
                    completed: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
                    'no-show': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
                  };

                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ 
                        top: `${topPosition}px`, 
                        height: `${Math.max(height - 4, 120)}px`,
                        zIndex: 10
                      }}
                      className={`
                        absolute left-0 right-2 lg:right-4 rounded-2xl lg:rounded-3xl border-l-4 p-4 lg:p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden
                        ${statusColors[apt.status] || 'bg-white dark:bg-dark-silver border-brand-rose/20'}
                        bg-white/95 dark:bg-dark-silver/95 backdrop-blur-md
                      `}
                    >
                      <div className="flex justify-between items-start h-full gap-3 lg:gap-6">
                        <div className="flex flex-col h-full min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <div className="flex items-center gap-1.5 lg:gap-2 text-[11px] lg:text-[13px] font-bold uppercase tracking-wider">
                              <Clock className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                              {apt.time}
                            </div>
                            <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                            <span className="text-[10px] lg:text-[12px] font-bold uppercase tracking-widest opacity-70">{apt.duration} min</span>
                            <Badge className="scale-90 lg:scale-100 origin-left py-0.5 lg:py-1 px-2 lg:px-3 text-[9px] lg:text-[11px] uppercase font-bold tracking-tighter">{apt.status}</Badge>
                            <Badge 
                              variant={apt.paymentStatus === 'paid' ? 'success' : 'warning'}
                              className="scale-90 lg:scale-100 origin-left py-0.5 lg:py-1 px-2 lg:px-3 text-[9px] lg:text-[11px] uppercase font-bold tracking-tighter"
                            >
                              {apt.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </div>
                          
                          <h5 className="text-base lg:text-lg font-bold text-brand-taupe dark:text-white mb-1 lg:mb-2 group-hover:text-brand-rose transition-colors leading-tight">
                            {apt.clientName}
                          </h5>
                          
                          <p className="text-xs lg:text-base font-semibold text-brand-taupe/70 dark:text-white/60 mb-2 lg:mb-3 leading-snug">
                            {apt.serviceName}
                          </p>

                          {height > 120 && apt.notes && (
                            <div className="mt-auto pt-3 lg:pt-4 border-t border-current/10 hidden sm:block">
                              <p className="text-[11px] lg:text-[13px] italic opacity-50 line-clamp-2 lg:line-clamp-3">
                                "{apt.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 lg:gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0">
                          <button className="p-2 lg:p-3 bg-brand-rose text-white rounded-xl lg:rounded-2xl shadow-lg shadow-rose-500/20 hover:scale-110 transition-all">
                            <Check className="w-4 lg:w-5 h-4 lg:h-5" />
                          </button>
                          <button className="p-2 lg:p-3 bg-white dark:bg-white/10 text-brand-taupe dark:text-white rounded-xl lg:rounded-2xl border border-brand-rose/10 hover:bg-rose-500 hover:text-white shadow-sm transition-all">
                            <X className="w-4 lg:w-5 h-4 lg:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-brand-taupe/30 dark:text-white/20">
                  <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">No hay turnos para este día</p>
                  <Button variant="ghost" size="sm" className="mt-4" icon={Plus}>Agendar Turno</Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Day Agenda Modal (Popup) */}
      <AnimatePresence>
        {showDayModal && modalDate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDayModal(false)}
              className="absolute inset-0 bg-brand-taupe/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-rose/10"
            >
              <div className="p-6 lg:p-10 border-b border-brand-rose/5 dark:border-white/5 bg-brand-blush/20 dark:bg-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-serif italic text-brand-taupe dark:text-white capitalize">
                    {modalDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="text-brand-taupe/50 dark:text-white/50 text-xs lg:text-sm mt-1">Resumen de agenda para hoy</p>
                </div>
                <button 
                  onClick={() => setShowDayModal(false)}
                  className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-2xl text-brand-taupe dark:text-white transition-all shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 lg:p-10 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col gap-6">
                  {getAppointmentsForDate(modalDate).length > 0 ? (
                    getAppointmentsForDate(modalDate).map((apt) => (
                      <div key={apt.id} className="flex gap-6 items-start group">
                        <div className="flex flex-col items-center gap-2 pt-1">
                          <span className="text-sm font-bold text-brand-taupe dark:text-white">{apt.time}</span>
                          <div className="w-px h-full bg-brand-rose/20 dark:bg-white/10" />
                        </div>
                        <div className="flex-1 bg-brand-ivory/50 dark:bg-white/5 p-5 lg:p-6 rounded-3xl border border-brand-rose/5 dark:border-white/5 group-hover:border-brand-rose/20 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="text-lg font-bold text-brand-taupe dark:text-white mb-1">{apt.clientName}</h5>
                              <div className="flex items-center gap-2 text-brand-rose">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-semibold">{apt.serviceName}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'}>{apt.status}</Badge>
                              <Badge variant={apt.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                {apt.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-brand-rose/5 dark:border-white/5">
                            <div className="flex items-center gap-2 text-xs text-brand-taupe/50 dark:text-white/40">
                              <Clock className="w-4 h-4" />
                              <span>{apt.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-taupe/50 dark:text-white/40">
                              <User className="w-4 h-4" />
                              <span>{apt.clientName.split(' ')[0]}</span>
                            </div>
                          </div>

                          {apt.paymentStatus !== 'paid' && (
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-[10px] sm:text-xs" 
                                icon={CreditCard}
                                onClick={() => handleStripePayment(apt)}
                                disabled={isProcessingPayment}
                              >
                                Tarjeta Int.
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-[10px] sm:text-xs" 
                                icon={WalletIcon}
                                onClick={() => handleMPPayment(apt)}
                                disabled={isProcessingPayment}
                              >
                                Mercado Pago
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-brand-taupe/30 dark:text-white/20">
                      <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-serif italic">No hay turnos agendados</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 lg:p-10 bg-brand-blush/10 dark:bg-white/5 flex gap-4">
                <Button 
                  className="flex-1 py-4 lg:py-5 text-base" 
                  icon={Plus}
                  onClick={() => {
                    setShowDayModal(false);
                    setShowNewAppointmentModal(true);
                  }}
                >
                  Nuevo Turno
                </Button>
                <Button variant="outline" className="flex-1 py-4 lg:py-5 text-base" onClick={() => setShowDayModal(false)}>Cerrar</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showNewAppointmentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewAppointmentModal(false)}
              className="absolute inset-0 bg-brand-taupe/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-rose/10"
            >
              <div className="p-6 lg:p-8 border-b border-brand-rose/5 dark:border-white/5 bg-brand-blush/20 dark:bg-white/5 flex justify-between items-center">
                <h3 className="text-xl lg:text-2xl font-serif italic text-brand-taupe dark:text-white">Nuevo Turno</h3>
                <button 
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl text-brand-taupe dark:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="p-6 lg:p-8 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Cliente</label>
                    <button 
                      type="button"
                      onClick={() => setIsNewClient(!isNewClient)}
                      className="text-[10px] font-bold text-brand-rose uppercase tracking-wider hover:underline"
                    >
                      {isNewClient ? 'Elegir Existente' : '+ Nueva Clienta'}
                    </button>
                  </div>
                  
                  {isNewClient ? (
                    <div className="space-y-3 p-4 bg-brand-blush/10 dark:bg-white/5 rounded-2xl border border-brand-rose/10">
                      <Input name="newClientName" placeholder="Nombre completo" required />
                      <Input name="newClientPhone" placeholder="Teléfono" />
                    </div>
                  ) : (
                    <select 
                      name="clientId" 
                      className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all"
                      required
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Servicio</label>
                  <select 
                    name="serviceId" 
                    className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all"
                    required
                  >
                    <option value="">Seleccionar Servicio</option>
                    {MOCK_SERVICES.map(service => (
                      <option key={service.id} value={service.id}>{service.name} (${service.price})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Fecha</label>
                    <Input name="date" type="date" defaultValue={formatDate(selectedDate)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Hora</label>
                    <Input name="time" type="time" required />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1">Agendar Turno</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewAppointmentModal(false)}>Cancelar</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default Agenda;

import React from 'react';
import { Card, Badge, Button } from './UI';
import {
  TrendingUp,
  Users,
  Calendar,
  Wallet,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { MOCK_APPOINTMENTS, MOCK_CLIENTS, MOCK_TRANSACTIONS } from '../types';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const Dashboard: React.FC = () => {
  const totalPaidToday = MOCK_TRANSACTIONS
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const avgTicket = MOCK_APPOINTMENTS.length
    ? MOCK_APPOINTMENTS.reduce((sum, appointment) => sum + appointment.totalAmount, 0) / MOCK_APPOINTMENTS.length
    : 0;

  const cashTotal = MOCK_TRANSACTIONS
    .filter((transaction) => transaction.method === 'cash' && transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const transferTotal = MOCK_TRANSACTIONS
    .filter((transaction) => transaction.method === 'transfer' && transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const todayLabelRaw = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const todayLabel = todayLabelRaw.charAt(0).toUpperCase() + todayLabelRaw.slice(1);

  const kpis = [
    { label: 'Ingresos Hoy', value: currency.format(totalPaidToday), icon: Wallet, trend: '+demo', color: 'rose' },
    { label: 'Turnos Hoy', value: String(MOCK_APPOINTMENTS.length), icon: Calendar, trend: 'Activo', color: 'blush' },
    {
      label: 'Clientas Nuevas',
      value: String(MOCK_CLIENTS.filter((client) => client.status === 'new').length),
      icon: Users,
      trend: 'Demo',
      color: 'champagne',
    },
    { label: 'Ticket Promedio', value: currency.format(avgTicket), icon: TrendingUp, trend: 'Base', color: 'nude' },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif italic text-brand-taupe dark:text-white">Hola, profesional</h2>
          <p className="text-brand-taupe/50 dark:text-white/50 text-xs lg:text-sm">
            Hoy es {todayLabel}. Tenés {MOCK_APPOINTMENTS.length} turnos demo programados.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            Ver Reportes
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            Nuevo Turno
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="flex flex-col gap-3 lg:gap-4 p-4 lg:p-6">
            <div className="flex justify-between items-start">
              <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-brand-${kpi.color}/30 dark:bg-brand-rose/20 text-brand-taupe dark:text-brand-rose`}>
                <kpi.icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 lg:gap-1">
                <ArrowUpRight className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> {kpi.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] lg:text-xs font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-wider">
                {kpi.label}
              </p>
              <h4 className="text-xl lg:text-2xl font-bold text-brand-taupe dark:text-white">{kpi.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <Card className="lg:col-span-2 flex flex-col gap-6 p-4 lg:p-8">
          <div className="flex justify-between items-center">
            <h3 className="text-base lg:text-lg font-semibold text-brand-taupe dark:text-white">Próximas Citas</h3>
            <Button variant="ghost" size="sm" className="text-[10px] lg:text-xs">
              Ver Agenda Completa
            </Button>
          </div>

          <div className="flex flex-col gap-3 lg:gap-4">
            {MOCK_APPOINTMENTS.map((apt) => (
              <div
                key={apt.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 rounded-2xl border border-brand-rose/5 dark:border-white/5 hover:bg-brand-blush/10 dark:hover:bg-white/5 transition-all duration-300 gap-3"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-brand-ivory dark:bg-dark-silver flex flex-col items-center justify-center border border-brand-rose/10 dark:border-white/10 shrink-0">
                    <span className="text-[10px] lg:text-xs font-bold text-brand-taupe dark:text-white">{apt.time}</span>
                    <span className="text-[7px] lg:text-[8px] uppercase font-bold text-brand-taupe/40 dark:text-white/40">
                      AM
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-brand-taupe dark:text-white leading-tight">{apt.clientName}</h5>
                    <p className="text-[11px] lg:text-xs text-brand-taupe/50 dark:text-white/50 leading-snug">
                      {apt.serviceName} • {apt.duration} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'} className="text-[10px] lg:text-xs">
                    {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                  </Badge>
                  <button className="p-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-brand-taupe/40 dark:text-white/40" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="bg-brand-rose dark:bg-brand-rose/90 text-white border-none shadow-lg p-6 lg:p-8">
            <h3 className="text-base lg:text-lg font-bold mb-4">Resumen de Caja</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm opacity-90 font-medium">Efectivo</span>
                <span className="font-bold">{currency.format(cashTotal)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm opacity-90 font-medium">Transferencias</span>
                <span className="font-bold">{currency.format(transferTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold">Total Cobrado</span>
                <span className="text-xl font-bold">{currency.format(totalPaidToday)}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-6 bg-white text-brand-rose hover:bg-brand-ivory font-bold shadow-sm"
            >
              Cerrar Caja
            </Button>
          </Card>

          <Card className="flex flex-col gap-4 p-4 lg:p-6">
            <h3 className="text-xs font-semibold text-brand-taupe dark:text-white uppercase tracking-wider">Recordatorios</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] lg:text-xs text-amber-800 dark:text-amber-200">
                  Confirmar reserva de <b>Clienta Demo 02</b> para mañana.
                </p>
              </div>
              <div className="flex gap-3 items-start p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[11px] lg:text-xs text-emerald-800 dark:text-emerald-200">
                  Stock demo de insumos actualizado.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

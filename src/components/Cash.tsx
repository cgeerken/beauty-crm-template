import React from 'react';
import { Card, Badge, Button } from './UI';
import { 
  Plus, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../types';

const Cash: React.FC = () => {
  const stats = [
    { label: 'Ingresos Mes', value: '$142.000', icon: ArrowUpRight, color: 'emerald' },
    { label: 'Gastos Mes', value: '$38.500', icon: ArrowDownLeft, color: 'rose' },
    { label: 'Balance Neto', value: '$103.500', icon: Wallet, color: 'brand-rose' },
  ];

  const methods: Record<string, any> = {
    cash: { icon: Banknote, label: 'Efectivo' },
    transfer: { icon: Smartphone, label: 'Transferencia' },
    card: { icon: CreditCard, label: 'Tarjeta' },
    wallet: { icon: Wallet, label: 'Billetera Virtual' },
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-brand-taupe dark:text-white">Caja y Pagos</h2>
          <p className="text-brand-taupe/70 dark:text-white/50 text-xs sm:text-sm font-medium">Controlá tus ingresos, señas y gastos diarios.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" icon={Download} className="flex-1 sm:flex-none text-xs sm:text-sm">Exportar</Button>
          <Button icon={Plus} className="flex-1 sm:flex-none text-xs sm:text-sm">Registrar</Button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4 sm:gap-6 dark:bg-dark-card border border-brand-rose/10 dark:border-white/5 p-4 sm:p-6">
            <div className={`p-3 sm:p-4 rounded-2xl bg-${stat.color === 'brand-rose' ? 'brand-rose' : stat.color + '-100'} dark:bg-brand-rose/20 text-${stat.color === 'brand-rose' ? 'white' : stat.color + '-600'} dark:text-brand-rose`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-xl sm:text-2xl font-bold text-brand-taupe dark:text-white">{stat.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-6 dark:bg-dark-card p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-brand-taupe dark:text-white">Movimientos Recientes</h3>
          <Button variant="ghost" size="sm" icon={Filter} className="text-xs">Filtrar</Button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
            <thead>
              <tr className="border-b border-brand-rose/5 dark:border-white/5">
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/40 dark:text-white/40 uppercase tracking-widest">Fecha</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/40 dark:text-white/40 uppercase tracking-widest">Detalle</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/40 dark:text-white/40 uppercase tracking-widest hidden sm:table-cell">Método</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/40 dark:text-white/40 uppercase tracking-widest">Monto</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/40 dark:text-white/40 uppercase tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-rose/5 dark:divide-white/5">
              {MOCK_TRANSACTIONS.map((tx) => {
                const MethodIcon = methods[tx.method].icon;
                return (
                  <tr key={tx.id} className="group hover:bg-brand-blush/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-[10px] sm:text-xs text-brand-taupe/60 dark:text-white/60">{tx.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <p className="text-xs sm:text-sm font-semibold text-brand-taupe dark:text-white">{tx.clientName}</p>
                        <p className="text-[9px] sm:text-[10px] text-brand-taupe/40 dark:text-white/40">{tx.description}</p>
                        <div className="sm:hidden mt-1 flex items-center gap-1 text-[9px] text-brand-taupe/60 dark:text-white/60">
                          <MethodIcon className="w-2.5 h-2.5" />
                          {methods[tx.method].label}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-xs text-brand-taupe/60 dark:text-white/60">
                        <MethodIcon className="w-3 h-3" />
                        {methods[tx.method].label}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs sm:text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} className="px-2 py-0.5 text-[9px]">
                        {tx.status === 'completed' ? 'OK' : 'Pend'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Cash;

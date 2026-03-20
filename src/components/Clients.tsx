import React, { useState } from 'react';
import { Card, Badge, Button, Input } from './UI';
import { 
  Search, 
  Plus, 
  Phone, 
  Instagram, 
  MoreVertical,
  Calendar,
  History,
  AlertTriangle
} from 'lucide-react';
import { MOCK_CLIENTS } from '../types';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-brand-taupe dark:text-white">Clientas</h2>
          <p className="text-brand-taupe/50 dark:text-white/50 text-xs sm:text-sm">Gestioná tu base de datos y el historial de cada clienta.</p>
        </div>
        <Button icon={Plus} className="w-full sm:w-auto">Nueva Clienta</Button>
      </header>

      <Card className="flex flex-col gap-6 dark:bg-dark-card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-taupe/60 dark:text-white/40" />
            <input 
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-11 pr-4 py-2.5 bg-brand-ivory/80 dark:bg-white/5 border border-brand-rose/30 dark:border-white/10 rounded-2xl text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs whitespace-nowrap">Frecuentes</Button>
            <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs whitespace-nowrap">Nuevas</Button>
            <Button variant="ghost" size="sm" className="text-[10px] sm:text-xs text-rose-500 whitespace-nowrap">Con Deuda</Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
            <thead>
              <tr className="border-b border-brand-rose/20 dark:border-white/10">
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-widest">Clienta</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-widest hidden sm:table-cell">Contacto</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-widest">Estado</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-widest hidden md:table-cell">Última Visita</th>
                <th className="pb-4 px-4 text-[10px] font-bold text-brand-taupe/60 dark:text-white/40 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-rose/5 dark:divide-white/5">
              {filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-brand-blush/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-champagne/30 dark:bg-white/10 flex items-center justify-center text-brand-taupe dark:text-white font-serif italic text-sm sm:text-base">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-brand-taupe dark:text-white">{client.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-brand-taupe/40 dark:text-white/40">ID: {client.id}</p>
                        <div className="sm:hidden mt-1 flex flex-col gap-0.5">
                          <p className="text-[10px] text-brand-taupe/60 dark:text-white/60">{client.phone}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-brand-taupe/60 dark:text-white/60">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </div>
                      {client.instagram && (
                        <div className="flex items-center gap-2 text-xs text-brand-rose">
                          <Instagram className="w-3 h-3" /> {client.instagram}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant={
                        client.status === 'frequent' ? 'success' : 
                        client.status === 'debt' ? 'danger' : 
                        client.status === 'new' ? 'info' : 'default'
                      }
                      className="px-2 py-0.5 text-[9px] sm:text-[10px]"
                    >
                      {client.status === 'frequent' ? 'Frecuente' : 
                       client.status === 'debt' ? 'Deuda' : 
                       client.status === 'new' ? 'Nueva' : 'Activa'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-xs text-brand-taupe/60 dark:text-white/60">{client.lastVisit || 'Sin visitas'}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 sm:p-2 hover:bg-brand-blush/50 dark:hover:bg-white/10 rounded-full text-brand-taupe/40 dark:text-white/40 hover:text-brand-taupe dark:hover:text-white transition-colors">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1.5 sm:p-2 hover:bg-brand-blush/50 dark:hover:bg-white/10 rounded-full text-brand-taupe/40 dark:text-white/40 hover:text-brand-taupe dark:hover:text-white transition-colors">
                        <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button className="p-1.5 sm:p-2 hover:bg-brand-blush/50 dark:hover:bg-white/10 rounded-full text-brand-taupe/40 dark:text-white/40 hover:text-brand-taupe dark:hover:text-white transition-colors">
                        <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Clients;

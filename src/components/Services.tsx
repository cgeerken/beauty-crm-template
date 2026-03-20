import React, { useState } from 'react';
import { Card, Badge, Button, Input } from './UI';
import { 
  Plus, 
  Sparkles, 
  Clock, 
  DollarSign, 
  MoreVertical,
  Scissors,
  Palette,
  Eye,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { MOCK_SERVICES, Service, ServiceCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');

  const categories = [
    { id: 'pestañas', label: 'Pestañas', icon: Eye, color: 'rose' },
    { id: 'uñas', label: 'Uñas', icon: Palette, color: 'blush' },
    { id: 'micropigmentación', label: 'Micropigmentación', icon: Scissors, color: 'champagne' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const serviceData: Service = {
      id: editingService?.id || `s${Date.now()}`,
      name: formData.get('name') as string,
      category: formData.get('category') as ServiceCategory,
      duration: parseInt(formData.get('duration') as string),
      price: parseInt(formData.get('price') as string),
      depositRequired: parseInt(formData.get('depositRequired') as string),
      description: formData.get('description') as string,
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
    } else {
      setServices([...services, serviceData]);
    }
    
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif italic text-brand-taupe dark:text-white">Servicios</h2>
          <p className="text-brand-taupe/50 dark:text-white/50 text-xs sm:text-sm">Configurá tu carta de servicios, precios y duraciones.</p>
        </div>
        <Button 
          icon={Plus} 
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
        >
          Nuevo Servicio
        </Button>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl transition-all group whitespace-nowrap border ${activeCategory === 'all' ? 'bg-brand-rose text-white border-brand-rose' : 'bg-white dark:bg-dark-card text-brand-taupe dark:text-white border-brand-rose/5 dark:border-white/5'}`}
        >
          <span className="text-xs sm:text-sm font-semibold">Todos</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as ServiceCategory)}
            className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl transition-all group whitespace-nowrap border ${activeCategory === cat.id ? 'bg-brand-rose text-white border-brand-rose' : 'bg-white dark:bg-dark-card text-brand-taupe dark:text-white border-brand-rose/5 dark:border-white/5 hover:border-brand-rose/20'}`}
          >
            <div className={`p-1.5 sm:p-2 rounded-xl ${activeCategory === cat.id ? 'bg-white/20 text-white' : `bg-brand-${cat.color}/30 dark:bg-brand-rose/20 text-brand-taupe dark:text-brand-rose`} group-hover:scale-110 transition-transform`}>
              <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-xs sm:text-sm font-semibold">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="group hover:border-brand-rose/20 border border-transparent transition-all flex flex-col justify-between dark:bg-dark-card p-4 sm:p-6">
            <div>
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <Badge variant="info" className="text-[9px] sm:text-[10px]">{service.category}</Badge>
                <div className="flex gap-1">
                  <button 
                    onClick={() => openEditModal(service)}
                    className="p-2 hover:bg-brand-blush/50 dark:hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-taupe/40 dark:text-white/40" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                  </button>
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-brand-taupe dark:text-white mb-1 sm:mb-2">{service.name}</h4>
              <p className="text-[11px] sm:text-xs text-brand-taupe/50 dark:text-white/50 line-clamp-2 mb-4 sm:mb-6">{service.description}</p>
              
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 text-brand-taupe/60 dark:text-white/60">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs font-medium">{service.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-brand-taupe/60 dark:text-white/60">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs font-medium">${service.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-rose/5 dark:border-white/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-taupe/30 dark:text-white/30">Seña Requerida</span>
                <span className="text-xs sm:text-sm font-bold text-brand-rose">${service.depositRequired.toLocaleString()}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-[11px] sm:text-xs" onClick={() => openEditModal(service)}>Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-taupe/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-rose/10"
            >
              <div className="p-6 lg:p-8 border-b border-brand-rose/5 dark:border-white/5 bg-brand-blush/20 dark:bg-white/5 flex justify-between items-center">
                <h3 className="text-xl lg:text-2xl font-serif italic text-brand-taupe dark:text-white">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl text-brand-taupe dark:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="p-6 lg:p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Nombre del Servicio</label>
                  <Input name="name" defaultValue={editingService?.name} placeholder="Ej: Extensiones Clásicas" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Categoría</label>
                    <select 
                      name="category" 
                      defaultValue={editingService?.category || 'pestañas'}
                      className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Duración (min)</label>
                    <Input name="duration" type="number" defaultValue={editingService?.duration} placeholder="60" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Precio ($)</label>
                    <Input name="price" type="number" defaultValue={editingService?.price} placeholder="3500" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Seña ($)</label>
                    <Input name="depositRequired" type="number" defaultValue={editingService?.depositRequired} placeholder="1000" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Descripción</label>
                  <textarea 
                    name="description" 
                    defaultValue={editingService?.description}
                    placeholder="Describe brevemente el servicio..."
                    className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all min-h-[100px]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="flex-1">Guardar Servicio</Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;

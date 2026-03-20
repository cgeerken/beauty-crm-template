import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input } from './UI';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Calendar, 
  Shield, 
  Bell,
  Save,
  Moon,
  Sun,
  Lock,
  CreditCard,
  Wallet as WalletIcon
} from 'lucide-react';
import { DEFAULT_CONFIG, BusinessConfig } from '../types';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Settings: React.FC = () => {
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      if (!auth.currentUser) return;
      
      try {
        const docRef = doc(db, 'salons', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          if (data.config) {
            setConfig(data.config);
          }
        }
      } catch (error) {
        console.error("Error loading config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'salons', auth.currentUser.uid);
      // We store both the config object for the frontend and the payments object top-level for the backend
      await setDoc(docRef, {
        config: config,
        payments: config.payments
      }, { merge: true });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error al guardar la configuración");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-rose"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <header>
        <h2 className="text-2xl sm:text-3xl font-serif italic text-brand-taupe dark:text-white">Configuración</h2>
        <p className="text-brand-taupe/50 dark:text-white/50 text-xs sm:text-sm">Personalizá tu salón y reglas de negocio.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Business Hours */}
        <Card className="lg:col-span-2 p-6 sm:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-brand-rose/5 pb-6">
            <div className="p-3 rounded-2xl bg-brand-blush/30 dark:bg-brand-rose/20 text-brand-rose">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-taupe dark:text-white">Horarios de Atención</h3>
              <p className="text-xs text-brand-taupe/50 dark:text-white/40">Definí cuándo está abierto tu salón.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Hora de Apertura</label>
                <div className="relative">
                  <Sun className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-taupe/30" />
                  <input 
                    type="time" 
                    value={config.workingHours.start}
                    onChange={(e) => setConfig({...config, workingHours: {...config.workingHours, start: e.target.value}})}
                    className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-brand-taupe/40 dark:text-white/30 tracking-widest ml-1">Hora de Cierre</label>
                <div className="relative">
                  <Moon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-taupe/30" />
                  <input 
                    type="time" 
                    value={config.workingHours.end}
                    onChange={(e) => setConfig({...config, workingHours: {...config.workingHours, end: e.target.value}})}
                    className="w-full bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-brand-rose/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-taupe dark:text-white">Evitar Superposición</h4>
                  <p className="text-[10px] text-brand-taupe/50 dark:text-white/40">No permitir agendar dos turnos al mismo tiempo.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setConfig({...config, allowOverlaps: !config.allowOverlaps})}
                  className={`w-12 h-6 rounded-full transition-all relative ${!config.allowOverlaps ? 'bg-brand-rose' : 'bg-brand-taupe/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${!config.allowOverlaps ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-brand-taupe dark:text-white">Intervalo de Turnos</h4>
                  <p className="text-[10px] text-brand-taupe/50 dark:text-white/40">Duración mínima de cada bloque de tiempo.</p>
                </div>
                <select 
                  value={config.slotDuration}
                  onChange={(e) => setConfig({...config, slotDuration: parseInt(e.target.value)})}
                  className="bg-brand-ivory/50 dark:bg-white/5 border border-brand-rose/10 dark:border-white/10 rounded-xl px-3 py-1 text-xs text-brand-taupe dark:text-white"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>

            <div className="pt-6">
              <Button icon={Save} type="submit" className="w-full sm:w-auto">
                {isSaved ? '¡Cambios Guardados!' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Payments Configuration */}
        <Card className="lg:col-span-3 p-6 sm:p-8 space-y-8">
          <div className="flex items-center gap-4 border-b border-brand-rose/5 pb-6">
            <div className="p-3 rounded-2xl bg-brand-blush/30 dark:bg-brand-rose/20 text-brand-rose">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-taupe dark:text-white">Pagos y Cobros</h3>
              <p className="text-xs text-brand-taupe/50 dark:text-white/40">Conectá tus cuentas para recibir el dinero directamente.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stripe Section */}
            <div className="space-y-6 p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Stripe (Internacional)</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-900/40 dark:text-indigo-100/30 tracking-widest ml-1">Publishable Key</label>
                  <input 
                    type="password" 
                    value={config.payments.stripePublicKey || ''}
                    onChange={(e) => setConfig({...config, payments: {...config.payments, stripePublicKey: e.target.value}})}
                    placeholder="pk_live_..."
                    className="w-full bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-indigo-900/40 dark:text-indigo-100/30 tracking-widest ml-1">Secret Key</label>
                  <input 
                    type="password" 
                    value={config.payments.stripeSecretKey || ''}
                    onChange={(e) => setConfig({...config, payments: {...config.payments, stripeSecretKey: e.target.value}})}
                    placeholder="sk_live_..."
                    className="w-full bg-white dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mercado Pago Section */}
            <div className="space-y-6 p-6 rounded-[2rem] bg-sky-50/50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sky-900 dark:text-sky-100">Mercado Pago (Local)</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-sky-900/40 dark:text-sky-100/30 tracking-widest ml-1">Access Token</label>
                  <input 
                    type="password" 
                    value={config.payments.mpAccessToken || ''}
                    onChange={(e) => setConfig({...config, payments: {...config.payments, mpAccessToken: e.target.value}})}
                    placeholder="APP_USR-..."
                    className="w-full bg-white dark:bg-white/5 border border-sky-200 dark:border-sky-500/20 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-sky-900/40 dark:text-sky-100/30 tracking-widest ml-1">Public Key</label>
                  <input 
                    type="password" 
                    value={config.payments.mpPublicKey || ''}
                    onChange={(e) => setConfig({...config, payments: {...config.payments, mpPublicKey: e.target.value}})}
                    placeholder="APP_USR-..."
                    className="w-full bg-white dark:bg-white/5 border border-sky-200 dark:border-sky-500/20 rounded-2xl px-4 py-3 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button icon={Save} onClick={handleSave} className="w-full sm:w-auto">
              Guardar Credenciales de Pago
            </Button>
          </div>
        </Card>

        {/* Other Settings */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-brand-taupe dark:text-white mb-2">
              <Shield className="w-5 h-5 text-brand-rose" />
              <h3 className="font-bold text-sm">Seguridad</h3>
            </div>
            <p className="text-xs text-brand-taupe/50 dark:text-white/40">Gestioná tus contraseñas y accesos.</p>
            <Button variant="outline" size="sm" className="w-full" icon={Lock}>Cambiar Contraseña</Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-brand-taupe dark:text-white mb-2">
              <Bell className="w-5 h-5 text-brand-rose" />
              <h3 className="font-bold text-sm">Notificaciones</h3>
            </div>
            <p className="text-xs text-brand-taupe/50 dark:text-white/40">Configurá recordatorios por WhatsApp.</p>
            <Button variant="outline" size="sm" className="w-full">Configurar Avisos</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

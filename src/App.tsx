import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Clients from './components/Clients';
import Services from './components/Services';
import Cash from './components/Cash';
import Reservas from './components/Reservas';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithPopup, googleProvider, db, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const salonRef = doc(db, 'salons', currentUser.uid);
        const salonSnap = await getDoc(salonRef);

        if (!salonSnap.exists()) {
          await setDoc(salonRef, {
            name: currentUser.displayName || 'Mi Beauty Studio',
            ownerEmail: currentUser.email,
            createdAt: new Date().toISOString(),
          });
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-ivory dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-rose/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-brand-rose" />
          </div>
          <p className="text-brand-taupe/40 font-serif italic">Cargando Beauty CRM Template...</p>
        </div>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-brand-ivory dark:bg-dark-bg flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white dark:bg-dark-card p-8 sm:p-10 rounded-[40px] shadow-2xl border border-brand-rose/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-brand-blush/30 dark:bg-brand-rose/20 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-brand-rose" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif italic text-brand-taupe dark:text-white">Template listo para configurar</h1>
              <p className="text-brand-taupe/60 dark:text-white/40 mt-1">
                Esta versión pública no trae credenciales ni datos privados.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-brand-blush/30 dark:bg-white/5 border border-brand-rose/10 p-6 mb-8">
            <p className="text-sm text-brand-taupe dark:text-white/80 leading-relaxed">
              Para usar login, Firestore y sincronizaciones, copiá <code className="font-mono">.env.example</code> a
              <code className="font-mono"> .env</code>, completá las variables <code className="font-mono">VITE_FIREBASE_*</code>
              y reiniciá la app.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-brand-taupe/80 dark:text-white/70">
            <div className="rounded-2xl border border-brand-rose/10 p-4">1. <b>npm install</b></div>
            <div className="rounded-2xl border border-brand-rose/10 p-4">2. <b>cp .env.example .env</b></div>
            <div className="rounded-2xl border border-brand-rose/10 p-4">3. Cargá tu configuración de Firebase</div>
            <div className="rounded-2xl border border-brand-rose/10 p-4">4. Ejecutá <b>npm run dev</b></div>
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-widest text-brand-taupe/30 dark:text-white/20 font-bold">
            Beauty CRM Template
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-ivory dark:bg-dark-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-dark-card p-10 rounded-[40px] shadow-2xl border border-brand-rose/10 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-blush/30 dark:bg-brand-rose/20 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-brand-rose" />
          </div>
          <h1 className="text-4xl font-serif italic text-brand-taupe dark:text-white mb-4">Bienvenida</h1>
          <p className="text-brand-taupe/60 dark:text-white/40 mb-10 leading-relaxed">
            Gestioná tu estudio de belleza de forma profesional. Conectá agenda, reservas, clientas y pagos desde una misma base.
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-brand-rose hover:bg-rose-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Ingresar con Google
          </button>
          <p className="mt-8 text-[10px] uppercase tracking-widest text-brand-taupe/30 dark:text-white/20 font-bold">
            Beauty CRM Template
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'agenda':
        return <Agenda />;
      case 'clientas':
        return <Clients />;
      case 'servicios':
        return <Services />;
      case 'caja':
        return <Cash />;
      case 'reservas':
        return <Reservas />;
      case 'config':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-brand-taupe/40">
            <h3 className="text-xl font-serif italic">Módulo en construcción</h3>
            <p className="text-sm">Estamos trabajando para brindarte la mejor experiencia.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen transition-colors duration-500 overflow-x-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
      />

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto max-h-screen bg-brand-ivory dark:bg-dark-bg transition-colors duration-500">
        <div className="max-w-7xl mx-auto pb-24 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

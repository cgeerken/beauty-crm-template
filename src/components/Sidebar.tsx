import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Sparkles, 
  Wallet, 
  Clock, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth, signOut } from '../firebase';
import { User } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isDarkMode, toggleDarkMode, user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'reservas', label: 'Reservas Online', icon: Clock },
    { id: 'clientas', label: 'Clientas', icon: Users },
    { id: 'servicios', label: 'Servicios', icon: Sparkles },
    { id: 'caja', label: 'Caja / Pagos', icon: Wallet },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 h-screen bg-white dark:bg-dark-card border-r border-brand-rose/20 dark:border-white/5 flex-col p-6 sticky top-0 sidebar-shadow z-10 transition-colors duration-500">
        <div className="mb-10 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif italic text-brand-rose tracking-tight">Beauty Studio</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-taupe/60 dark:text-white/40 font-bold">Business OS</p>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-brand-blush/30 dark:bg-dark-silver/50 text-brand-taupe dark:text-brand-rose hover:scale-110 transition-all gold-border-shiny"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300
                  ${isActive 
                    ? 'bg-brand-blush dark:bg-brand-rose text-brand-taupe dark:text-white shadow-md' 
                    : 'text-brand-taupe/80 dark:text-white/40 hover:bg-brand-blush/50 dark:hover:bg-white/5 hover:text-brand-taupe dark:hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill">
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-brand-rose/5 dark:border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border border-brand-rose/20 dark:border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-champagne dark:bg-dark-silver flex items-center justify-center text-brand-taupe dark:text-white font-serif italic text-lg border border-brand-rose/20 dark:border-white/10">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-brand-taupe dark:text-white truncate max-w-[140px]">{user?.displayName || 'Usuario'}</span>
              <span className="text-[10px] text-brand-taupe/60 dark:text-white/40 uppercase tracking-wider font-semibold">Profesional</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-brand-taupe/60 dark:text-white/40 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-t border-brand-rose/10 dark:border-white/5 z-50 px-2 py-3 flex justify-around items-center sidebar-shadow">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all
                ${isActive 
                  ? 'text-brand-rose scale-110' 
                  : 'text-brand-taupe/40 dark:text-white/30'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button 
          onClick={toggleDarkMode}
          className="flex flex-col items-center gap-1 px-3 py-1 text-brand-taupe/40 dark:text-white/30"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-[10px] font-bold uppercase tracking-tighter">Modo</span>
        </button>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-brand-ivory dark:bg-dark-bg border-b border-brand-rose/5">
        <div>
          <h1 className="text-xl font-serif italic text-brand-rose tracking-tight">Beauty Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-brand-rose/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-champagne dark:bg-dark-silver flex items-center justify-center text-brand-taupe dark:text-white font-serif italic text-sm border border-brand-rose/20">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

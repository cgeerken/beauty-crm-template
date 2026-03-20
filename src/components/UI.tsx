import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon, XCircle } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-brand-rose text-white shadow-md hover:bg-brand-rose/90 hover:shadow-lg",
    secondary: "bg-brand-blush dark:bg-dark-silver/50 text-brand-taupe dark:text-white hover:bg-brand-blush/80 dark:hover:bg-dark-silver/80",
    outline: "border border-brand-rose/30 dark:border-white/20 text-brand-taupe dark:text-white hover:bg-brand-blush/20 dark:hover:bg-white/5",
    ghost: "text-brand-taupe dark:text-white/60 hover:bg-brand-blush/20 dark:hover:bg-white/5"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const hasBg = className.includes('bg-');
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${!hasBg ? 'bg-white dark:bg-dark-card' : ''} rounded-premium p-6 floating-card ${className}`}
    >
      {children}
    </motion.div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const variants: Record<string, string> = {
    default: "bg-brand-blush dark:bg-dark-silver/50 text-brand-taupe dark:text-white",
    success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20",
    warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20",
    danger: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20",
    info: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-xs font-semibold text-brand-taupe/60 dark:text-white/40 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      className={`bg-brand-ivory/50 dark:bg-dark-silver/30 border border-brand-rose/10 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm text-brand-taupe dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-rose/20 dark:focus:ring-white/10 transition-all ${className}`}
      {...props}
    />
    {error && <span className="text-[10px] text-rose-500 ml-1">{error}</span>}
  </div>
);

// --- Modal ---
export const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-taupe/20 dark:bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-dark-card rounded-premium-lg w-full max-w-lg overflow-hidden premium-shadow gold-border-shiny"
        >
          <div className="p-6 border-b border-brand-rose/5 dark:border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-brand-taupe dark:text-white">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-brand-blush/50 dark:hover:bg-white/5 rounded-full transition-colors">
              <XCircle className="w-5 h-5 text-brand-taupe/40 dark:text-white/40" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

import { 
  Calendar, 
  Users, 
  Sparkles, 
  Wallet, 
  Clock, 
  BarChart3, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Instagram,
  Phone,
  MessageCircle
} from 'lucide-react';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'in-progress' | 'completed' | 'no-show';

export type PaymentStatus = 'paid' | 'deposit-paid' | 'pending' | 'debt' | 'refunded';

export type ServiceCategory = 'pestañas' | 'uñas' | 'micropigmentación';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number; // in minutes
  price: number;
  depositRequired: number;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  instagram?: string;
  notes?: string;
  allergies?: string;
  birthday?: string;
  lastVisit?: string;
  totalSpent: number;
  status: 'active' | 'frequent' | 'new' | 'inactive' | 'debt';
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO format
  time: string; // HH:mm
  duration: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  appointmentId?: string;
  clientName: string;
  amount: number;
  type: 'income' | 'expense';
  method: 'cash' | 'transfer' | 'card' | 'wallet';
  status: 'completed' | 'pending' | 'cancelled';
  description: string;
}

export interface BusinessConfig {
  workingHours: {
    start: string; // HH:mm
    end: string;   // HH:mm
  };
  slotDuration: number; // in minutes
  allowOverlaps: boolean;
  payments: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    mpAccessToken?: string;
    mpPublicKey?: string;
  };
}

export const DEFAULT_CONFIG: BusinessConfig = {
  workingHours: {
    start: '09:00',
    end: '20:00',
  },
  slotDuration: 30,
  allowOverlaps: false,
  payments: {},
};

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Extensiones Clásicas', category: 'pestañas', duration: 90, price: 3500, depositRequired: 1000, description: 'Set inicial de extensiones pelo a pelo.' },
  { id: 's2', name: 'Volumen Ruso Natural', category: 'pestañas', duration: 120, price: 4500, depositRequired: 1500, description: 'Efecto más tupido con abanicos hechos a mano.' },
  { id: 's3', name: 'Lifting de Pestañas', category: 'pestañas', duration: 60, price: 2500, depositRequired: 500, description: 'Curvatura natural de tus propias pestañas.' },
  { id: 's4', name: 'Soft Gel Almond', category: 'uñas', duration: 90, price: 2800, depositRequired: 800, description: 'Extensiones de gel con forma almendrada.' },
  { id: 's5', name: 'Kapping Nude', category: 'uñas', duration: 60, price: 2200, depositRequired: 500, description: 'Refuerzo de uña natural con color nude.' },
  { id: 's6', name: 'Micropigmentación Cejas', category: 'micropigmentación', duration: 180, price: 15000, depositRequired: 5000, description: 'Diseño y pigmentación semipermanente de cejas.' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Clienta Demo 01', phone: '+54 11 0000-0001', instagram: '@demo_beauty_01', status: 'frequent', totalSpent: 25000, lastVisit: '2026-03-10' },
  { id: 'c2', name: 'Clienta Demo 02', phone: '+54 11 0000-0002', instagram: '@demo_beauty_02', status: 'active', totalSpent: 12000, lastVisit: '2026-03-15' },
  { id: 'c3', name: 'Clienta Demo 03', phone: '+54 11 0000-0003', status: 'new', totalSpent: 4500, lastVisit: '2026-03-18' },
  { id: 'c4', name: 'Clienta Demo 04', phone: '+54 11 0000-0004', instagram: '@demo_beauty_04', status: 'debt', totalSpent: 8000, lastVisit: '2026-02-20' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { 
    id: 'a1', 
    clientId: 'c1', 
    clientName: 'Clienta Demo 01', 
    serviceId: 's2', 
    serviceName: 'Volumen Ruso Natural', 
    date: '2026-03-20', 
    time: '10:00', 
    duration: 120, 
    status: 'confirmed', 
    paymentStatus: 'deposit-paid', 
    totalAmount: 4500, 
    paidAmount: 1500 
  },
  { 
    id: 'a2', 
    clientId: 'c2', 
    clientName: 'Clienta Demo 02', 
    serviceId: 's5', 
    serviceName: 'Kapping Nude', 
    date: '2026-03-20', 
    time: '14:00', 
    duration: 60, 
    status: 'pending', 
    paymentStatus: 'pending', 
    totalAmount: 2200, 
    paidAmount: 0 
  },
  { 
    id: 'a3', 
    clientId: 'c3', 
    clientName: 'Clienta Demo 03', 
    serviceId: 's1', 
    serviceName: 'Extensiones Clásicas', 
    date: '2026-03-20', 
    time: '16:30', 
    duration: 90, 
    status: 'confirmed', 
    paymentStatus: 'deposit-paid', 
    totalAmount: 3500, 
    paidAmount: 1000 
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-03-20', clientName: 'Clienta Demo 01', amount: 1500, type: 'income', method: 'transfer', status: 'completed', description: 'Seña Volumen Ruso' },
  { id: 't2', date: '2026-03-20', clientName: 'Clienta Demo 03', amount: 1000, type: 'income', method: 'cash', status: 'completed', description: 'Seña Extensiones Clásicas' },
];

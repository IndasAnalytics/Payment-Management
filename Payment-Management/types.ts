
export enum JobType {
  Offset = "Offset",
  Flexo = "Flexo",
  Digital = "Digital",
  Packaging = "Packaging",
  LargeFormat = "Large Format"
}

export enum InvoiceStatus {
  Paid = "Paid",
  PartiallyPaid = "Partially Paid",
  Pending = "Pending",
  Overdue = "Overdue"
}

export type UserRole = 'admin' | 'accounts' | 'sales' | 'viewer' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  // SaaS Subscription Info
  subscriptionStatus?: 'active' | 'past_due' | 'cancelled' | 'none';
  planName?: string;
  razorpaySubscriptionId?: string;
}

export interface Customer {
  id: string;
  name: string; // Contact Person
  companyName: string;
  email: string;
  mobile: string;
  city: string;
  creditLimit: number;
  currency: string;
  tags: JobType[];
  address?: string;
  gst?: string;
  notes?: string;
}

export interface ChequeDetails {
  chequeNumber: string;
  bankName: string;
  depositDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Cleared' | 'Bounced';
}

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  date: string;
  amount: number;
  mode: string; // Cash, Cheque, NEFT, UPI
  reference?: string;
  chequeDetails?: ChequeDetails;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: string;
  jobName: string; 
  jobType: JobType;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  currency: string;
  notes?: string;
  payments: Payment[];
}

export interface FollowUp {
  id: string;
  customerId: string;
  invoiceId?: string;
  date: string;
  mode: "Call" | "WhatsApp" | "Email" | "Visit";
  status: "Promised" | "No Answer" | "Dispute" | "Will Pay" | "Paid" | "Not Reachable" | "Sent" | "Read";
  nextFollowUpDate?: string;
  notes: string;
  contactPerson: string;
  userId?: string;
  location?: { lat: number; lng: number; address: string };
}

export interface Visit {
  id: string;
  customerId: string;
  date: string;
  userId: string;
  purpose: string;
  notes: string;
  location: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  currency: string;
  taxLabel: string; // e.g., GST, VAT
}

export interface ReminderSettings {
  daysBeforeDue: number;
  remindOnDue: boolean;
  daysAfterDueRepeat: number;
  enableWhatsApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
}

// --- SaaS / Subscription Types ---
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days usually, or just a label
  razorpayPlanId: string;
  description?: string;
  isActive: boolean;
}

export interface SystemSettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
}

export interface AppContextType {
  customers: Customer[];
  invoices: Invoice[];
  followUps: FollowUp[];
  payments: Payment[];
  visits: Visit[];
  settings: CompanySettings;
  reminderRules: ReminderSettings;
  
  // Actions
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  addPayment: (payment: Payment) => void;
  updatePaymentStatus: (id: string, status: 'Cleared' | 'Bounced') => void;
  
  addFollowUp: (f: FollowUp) => void;
  addVisit: (v: Visit) => void;
  
  updateSettings: (s: CompanySettings) => void;
  updateReminderRules: (r: ReminderSettings) => void;

  // Auth
  currentUser: User | null;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  
  // UX
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Logic
  calculateClientScore: (customerId: string) => { score: number; label: string; color: string };
  getRemindersDue: () => Array<{ client: Customer; invoice: Invoice; type: 'WhatsApp' | 'Email' | 'SMS'; message: string }>;
  
  // SaaS
  serverStatus: 'connected' | 'disconnected' | 'checking';
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Invoice, FollowUp, AppContextType, Payment, InvoiceStatus, User, UserRole, Visit, CompanySettings, ReminderSettings } from '../types';
import { MOCK_CUSTOMERS, MOCK_INVOICES, MOCK_FOLLOWUPS, MOCK_VISITS, MOCK_PAYMENTS, DEFAULT_SETTINGS, DEFAULT_REMINDER_RULES } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Initialization ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [reminderRules, setReminderRulesState] = useState<ReminderSettings>(DEFAULT_REMINDER_RULES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // --- API Fetching (Corrected for Vercel) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use relative paths (/api/...) which works on Vercel and via Vite Proxy locally
        const [custRes] = await Promise.allSettled([
           fetch('/api/customers'),
           // Add other endpoints as you convert them:
           // fetch('/api/invoices') 
        ]);

        if (custRes.status === 'fulfilled' && custRes.value.ok) {
           const data = await custRes.value.json();
           setCustomers(data);
           setServerStatus('connected');
           
           // Fallback for other data until APIs are ready
           if (invoices.length === 0) setInvoices(MOCK_INVOICES);
           if (payments.length === 0) setPayments(MOCK_PAYMENTS);
           if (followUps.length === 0) setFollowUps(MOCK_FOLLOWUPS);
           if (visits.length === 0) setVisits(MOCK_VISITS);
        } else {
           // Fallback to Mock Data if API fails (Local Dev without DB)
           console.warn("API Connection failed, using mock data");
           setCustomers(MOCK_CUSTOMERS);
           setInvoices(MOCK_INVOICES);
           setPayments(MOCK_PAYMENTS);
           setFollowUps(MOCK_FOLLOWUPS);
           setVisits(MOCK_VISITS);
           setServerStatus('disconnected');
        }

      } catch (error) {
        console.error("Critical Fetch Error", error);
        setServerStatus('disconnected');
        // Fallback
        setCustomers(MOCK_CUSTOMERS);
        setInvoices(MOCK_INVOICES);
        setPayments(MOCK_PAYMENTS);
        setFollowUps(MOCK_FOLLOWUPS);
        setVisits(MOCK_VISITS);
      }
    };

    fetchData();
  }, []);

  // Theme Logic
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // ... (Keep existing Action functions like addCustomer, addInvoice, etc. but update them to call fetch('/api/...') instead of localhost:5000)

  // Example of updated addCustomer
  const addCustomer = async (c: Customer) => {
      // Optimistic Update
      setCustomers([...customers, c]);
      try {
          await fetch('/api/customers', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(c)
          });
      } catch (e) {
          console.error("Failed to sync customer", e);
      }
  };

  // Placeholder functions for context compliance
  const updateCustomer = (c: Customer) => setCustomers(customers.map(x => x.id === c.id ? c : x));
  const deleteCustomer = (id: string) => setCustomers(customers.filter(x => x.id !== id));
  const addInvoice = (i: Invoice) => setInvoices([...invoices, i]);
  const updateInvoice = (i: Invoice) => setInvoices(invoices.map(x => x.id === i.id ? i : x));
  const deleteInvoice = (id: string) => setInvoices(invoices.filter(x => x.id !== id));
  const addPayment = (p: Payment) => setPayments([...payments, p]);
  const updatePaymentStatus = (id: string, s: any) => {}; 
  const addFollowUp = (f: FollowUp) => setFollowUps([...followUps, f]);
  const addVisit = (v: Visit) => setVisits([...visits, v]);
  const updateSettings = (s: CompanySettings) => setSettings(s);
  const updateReminderRules = (r: ReminderSettings) => setReminderRulesState(r);
  
  const login = (email: string, role: UserRole = 'admin') => setCurrentUser({ id: 'u1', name: 'User', email, role });
  const logout = () => setCurrentUser(null);
  const calculateClientScore = () => ({ score: 5, label: 'Good', color: 'green' });
  const getRemindersDue = () => [];

  return (
    <AppContext.Provider value={{
      customers, invoices, followUps, payments, visits, settings, reminderRules,
      addCustomer, updateCustomer, deleteCustomer,
      addInvoice, updateInvoice, deleteInvoice,
      addPayment, updatePaymentStatus, addFollowUp, addVisit,
      updateSettings, updateReminderRules,
      currentUser, login, logout,
      language, setLanguage,
      theme, toggleTheme,
      calculateClientScore, getRemindersDue,
      serverStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
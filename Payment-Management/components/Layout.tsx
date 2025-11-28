
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, PhoneOutgoing, 
  PieChart, Settings, LogOut, Menu, Bell, Globe, Calendar, Search, MapPin, CreditCard, Sun, Moon, ShieldCheck, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { UserRole } from '../types';

export const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const { logout, currentUser, language, setLanguage, customers, invoices, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const t = TRANSLATIONS[language];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Global Search Logic
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    
    const matchedCustomers = customers.filter(c => 
      c.companyName.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
    ).map(c => ({ type: 'Customer', ...c }));

    const matchedInvoices = invoices.filter(i => 
      i.invoiceNumber.toLowerCase().includes(query)
    ).map(i => ({ type: 'Invoice', ...i }));

    setSearchResults([...matchedCustomers, ...matchedInvoices].slice(0, 5));
  }, [searchQuery, customers, invoices]);

  const handleSearchResultClick = (result: any) => {
    setSearchQuery('');
    setSearchResults([]);
    if (result.type === 'Customer') navigate('/dashboard/customers'); // Ideally drill down to ID
    if (result.type === 'Invoice') navigate('/dashboard/invoices');
  };

  const getNavItems = (role: UserRole) => {
    const items = [
      { icon: LayoutDashboard, label: t.dashboard, path: '/dashboard', roles: ['admin', 'sales', 'accounts', 'viewer', 'superadmin'] },
      { icon: Users, label: t.customers, path: '/dashboard/customers', roles: ['admin', 'sales', 'viewer'] },
      { icon: FileText, label: t.invoices, path: '/dashboard/invoices', roles: ['admin', 'accounts', 'viewer'] },
      { icon: CreditCard, label: t.payments, path: '/dashboard/payments', roles: ['admin', 'accounts'] },
      { icon: PhoneOutgoing, label: t.followups, path: '/dashboard/followups', roles: ['admin', 'sales'] },
      { icon: PieChart, label: t.reports, path: '/dashboard/reports', roles: ['admin', 'accounts', 'viewer'] },
      { icon: Settings, label: t.settings, path: '/dashboard/settings', roles: ['admin'] },
      
      // New Items
      { icon: Zap, label: 'Subscription', path: '/dashboard/subscription', roles: ['admin'] },
      { icon: ShieldCheck, label: 'Super Admin', path: '/superadmin', roles: ['superadmin'] },
    ];

    return items.filter(item => item.roles.includes(role));
  };

  const navItems = currentUser ? getNavItems(currentUser.role) : [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-brand-600 dark:bg-brand-700 text-white font-bold text-xl shadow-md">
          PrintPay ERP
        </div>
        
        <div className="px-4 py-2 bg-brand-50 dark:bg-gray-700 border-b border-brand-100 dark:border-gray-600 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-800 dark:text-gray-200 uppercase tracking-wider">{currentUser?.role} View</span>
        </div>

        <nav className="mt-5 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                location.pathname === item.path 
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`mr-4 h-5 w-5 ${location.pathname === item.path ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-400'}`} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button onClick={handleLogout} className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            {t.logout}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex justify-between items-center py-3 px-6 bg-white dark:bg-gray-800 shadow-sm z-10 print:hidden relative transition-colors duration-200">
          <div className="flex items-center flex-1">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden mr-4">
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Global Search Bar */}
            <div className="relative w-full max-w-md hidden md:block group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm text-gray-900 dark:text-white transition-colors"
                placeholder="Search clients or invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {/* Search Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1">
                  {searchResults.map((res, idx) => (
                    <div 
                      key={idx} 
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-0"
                      onClick={() => handleSearchResultClick(res)}
                    >
                       <p className="text-sm font-medium text-gray-900 dark:text-white">{res.companyName || res.invoiceNumber}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400">{res.type} {res.name ? `- ${res.name}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
            </button>
            <div className="flex items-center space-x-2">
               <Globe className="h-5 w-5 text-gray-400" />
               <select 
                 value={language} 
                 onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                 className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
               >
                 <option value="en">English</option>
                 <option value="hi">हिंदी</option>
               </select>
            </div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                 {currentUser?.name.charAt(0)}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};
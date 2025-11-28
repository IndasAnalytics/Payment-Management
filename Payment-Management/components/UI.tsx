import React, { Fragment } from 'react';
import { InvoiceStatus, JobType } from '../types';
import { Star, StarHalf } from 'lucide-react';

// --- Modal Component ---
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode, size?: 'md' | 'lg' | 'xl' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black opacity-50 dark:opacity-70" onClick={onClose}></div>
        <div className={`relative inline-block w-full ${sizeClasses[size]} p-6 my-8 text-left align-middle bg-white dark:bg-gray-800 dark:text-white shadow-xl rounded-2xl transform transition-all`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Badge Component ---
export const StatusBadge = ({ status }: { status: InvoiceStatus | string }) => {
  const styles: Record<string, string> = {
    [InvoiceStatus.Paid]: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    [InvoiceStatus.PartiallyPaid]: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    [InvoiceStatus.Pending]: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    [InvoiceStatus.Overdue]: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    'Offset': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Flexo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Digital': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Packaging': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const defaultStyle = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${styles[status] || defaultStyle}`}>
      {status}
    </span>
  );
};

// --- Button Component ---
export const Button = ({ children, onClick, variant = 'primary', className = '', type = "button" }: any) => {
  const base = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-600 dark:hover:bg-red-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white dark:bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
    whatsapp: "bg-green-500 text-white hover:bg-green-600 shadow-sm"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </button>
  );
};

// --- Card Component ---
export const Card = ({ title, value, subtext, icon: Icon, color = "blue", action }: any) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-500`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      {(subtext || action) && (
        <div className="mt-4 flex justify-between items-center">
           {subtext && <div className="text-sm text-gray-500 dark:text-gray-400">{subtext}</div>}
           {action}
        </div>
      )}
    </div>
  </div>
);

// --- Input Group ---
export const InputGroup = ({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
    />
  </div>
);

// --- Tabs Component ---
export const Tabs = ({ tabs, activeTab, onTabChange }: { tabs: string[], activeTab: string, onTabChange: (t: string) => void }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
            ${activeTab === tab
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
          `}
        >
          {tab}
        </button>
      ))}
    </nav>
  </div>
);

// --- Star Rating Component ---
export const StarRating = ({ score }: { score: number }) => {
  return (
    <div className="flex items-center space-x-0.5" title={`Client Score: ${score.toFixed(1)} / 5.0`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {score >= star ? (
            <Star className="w-4 h-4 fill-current text-yellow-400 text-yellow-400" />
          ) : score >= star - 0.5 ? (
            <div className="relative">
              <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
              </div>
            </div>
          ) : (
            <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          )}
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400">{score.toFixed(1)}</span>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, CheckCircle, Clock, Shield, ArrowRight, Menu, X, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Landing = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const handleLogin = (role: UserRole) => {
    login(`demo.${role}@printer.com`, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Printer className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PrintPay Tracker</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <div className="relative">
                <button 
                  onClick={() => setShowLoginOptions(!showLoginOptions)} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  Login <User className="ml-2 h-4 w-4" />
                </button>
                {showLoginOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border ring-1 ring-black ring-opacity-5">
                    <button onClick={() => handleLogin('admin')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login as Admin</button>
                    <button onClick={() => handleLogin('accounts')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login as Accounts</button>
                    <button onClick={() => handleLogin('sales')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login as Sales</button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white p-4 space-y-2 shadow-lg">
             <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700">Features</a>
             <button onClick={() => handleLogin('admin')} className="block w-full text-left px-3 py-2 text-base font-medium text-blue-600">Login (Admin Demo)</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative bg-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-blue-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Smart Payment Tracking</span>{' '}
                  <span className="block text-blue-600 xl:inline">for Printers</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Stop chasing payments manually. Track invoices, automate WhatsApp reminders, manage PDCs, and improve cash flow.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <button onClick={() => handleLogin('admin')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg">
                      Try Demo
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1562564025-51dc115152f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Printing press machine"
          />
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Built specifically for the Printing Industry
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-gray-900">WhatsApp Automation</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Send automated payment reminders with one click directly to your client's WhatsApp.
                  </dd>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-lg leading-6 font-medium text-gray-900">PDC Management</dt>
                  <dd className="mt-2 text-base text-gray-500">
                    Track post-dated cheques, deposit dates, and get notified before you deposit.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Printer className="h-6 w-6 text-blue-400" />
            <span className="ml-2 font-bold">PrintPay Tracker</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2023 PrintPay Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

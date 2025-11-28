

import React, { useState } from 'react';
import { IndianRupee, AlertTriangle, CheckCircle, Phone, Calendar, Mail, ArrowRight, Clock, Send, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card, StatusBadge, Button, Modal } from '../../components/UI';
import { TRANSLATIONS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Overview = () => {
  const { invoices, followUps, customers, getRemindersDue, settings } = useApp();
  const [selectedReminder, setSelectedReminder] = useState<any>(null);

  // --- Metrics ---
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  const totalOverdue = invoices
    .filter(inv => new Date(inv.dueDate) < new Date() && (inv.amount - inv.paidAmount) > 0)
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const reminders = getRemindersDue();

  // --- Charts Data ---
  // 1. Outstanding vs Paid
  const dataPie = [
    { name: 'Paid', value: totalPaid },
    { name: 'Outstanding', value: totalOutstanding },
  ];
  const COLORS = ['#10B981', '#3B82F6'];

  // 2. Collection vs Outstanding by Customer (Top 5)
  const topCustomers = customers.map(c => {
    const custInvoices = invoices.filter(i => i.customerId === c.id);
    return {
      name: c.companyName.substring(0, 10) + '...',
      Paid: custInvoices.reduce((s, i) => s + i.paidAmount, 0),
      Outstanding: custInvoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0),
    };
  }).sort((a, b) => b.Outstanding - a.Outstanding).slice(0, 5);

  const markReminderSent = () => {
    alert('Marked as sent!');
    setSelectedReminder(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Overview of your financials and daily tasks.</p>
        </div>
        <div className="text-right">
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
           <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          title="Total Outstanding"
          value={`${settings.currency} ${totalOutstanding.toLocaleString()}`} 
          icon={IndianRupee} 
          color="blue"
          subtext={`${((totalOutstanding/totalInvoiceAmount)*100).toFixed(1)}% of total billing`}
        />
        <Card 
          title="Total Overdue"
          value={`${settings.currency} ${totalOverdue.toLocaleString()}`} 
          icon={AlertTriangle} 
          color="red"
          subtext="Immediate attention needed"
        />
        <Card 
          title="Total Paid"
          value={`${settings.currency} ${totalPaid.toLocaleString()}`} 
          icon={CheckCircle} 
          color="green"
          subtext="Collection Efficiency"
        />
        <Card 
          title="Active Invoices"
          value={invoices.filter(i => i.status !== 'Paid').length} 
          icon={Calendar} 
          color="yellow"
          subtext="Files open"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Outstanding Balances</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={topCustomers}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis dataKey="name" stroke="#9CA3AF" />
                 <YAxis stroke="#9CA3AF" />
                 <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                 <Legend />
                 <Bar dataKey="Paid" stackId="a" fill="#10B981" />
                 <Bar dataKey="Outstanding" stackId="a" fill="#EF4444" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Status Overview</h3>
           <div className="h-64 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reminders & Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-orange-50 dark:bg-orange-900/20">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 flex items-center">
              <Clock className="h-5 w-5 mr-2" /> Reminders Due Today
            </h3>
            <span className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-100 text-xs px-2 py-1 rounded-full font-bold">{reminders.length}</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-10 w-10 mx-auto text-green-400 mb-2" />
                <p>No automatic reminders pending.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {reminders.map((rem, idx) => (
                  <li key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">{rem.client.companyName}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${rem.type === 'WhatsApp' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'}`}>{rem.type}</span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">Inv: {rem.invoice.invoiceNumber} • Due: {rem.invoice.dueDate}</p>
                         <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1">Pending: {settings.currency} {rem.invoice.amount - rem.invoice.paidAmount}</p>
                      </div>
                      <Button variant="outline" className="text-xs h-8" onClick={() => setSelectedReminder(rem)}>
                         Preview
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Follow Ups / Calls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-blue-50 dark:bg-blue-900/20">
             <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 flex items-center">
                <Phone className="h-5 w-5 mr-2" /> Today's Calls
             </h3>
             <Button variant="secondary" className="text-xs h-7">View All</Button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
             {/* Simple logic: follow ups scheduled for today */}
             {followUps.filter(f => f.nextFollowUpDate === new Date().toISOString().split('T')[0]).length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                   <p>No scheduled calls for today.</p>
                </div>
             ) : (
                <ul className="space-y-3">
                   {followUps.filter(f => f.nextFollowUpDate === new Date().toISOString().split('T')[0]).map(f => {
                      const c = customers.find(cust => cust.id === f.customerId);
                      return (
                         <li key={f.id} className="p-3 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                            <div>
                               <p className="font-bold text-sm text-gray-900 dark:text-white">{c?.companyName}</p>
                               <p className="text-xs text-gray-500 dark:text-gray-400">{c?.mobile}</p>
                            </div>
                            <Button variant="primary" className="text-xs h-8">Call</Button>
                         </li>
                      )
                   })}
                </ul>
             )}
          </div>
        </div>

      </div>

      {/* Message Preview Modal */}
      <Modal isOpen={!!selectedReminder} onClose={() => setSelectedReminder(null)} title={`Preview ${selectedReminder?.type} Message`}>
         {selectedReminder && (
            <div className="space-y-4">
               <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  {selectedReminder.message}
               </div>
               <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setSelectedReminder(null)}>Cancel</Button>
                  <Button variant={selectedReminder.type === 'WhatsApp' ? 'whatsapp' : 'primary'} onClick={markReminderSent}>
                     {selectedReminder.type === 'WhatsApp' && <MessageSquare className="h-4 w-4 mr-2" />}
                     {selectedReminder.type === 'Email' && <Mail className="h-4 w-4 mr-2" />}
                     Send Now (Simulated)
                  </Button>
               </div>
            </div>
         )}
      </Modal>

    </div>
  );
};


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, InputGroup, StatusBadge, Tabs } from '../../components/UI';
import { Payment } from '../../types';
import { CheckCircle, AlertCircle, Calendar, AlertTriangle, XCircle } from 'lucide-react';

export const Payments = () => {
  const { payments, customers, invoices, settings, updatePaymentStatus } = useApp();
  const [activeTab, setActiveTab] = useState('All Payments');

  // PDC Logic
  const pdcList = payments.filter(p => p.mode === 'Cheque' && p.chequeDetails?.status !== 'Cleared');
  
  // Sorting
  const sortedPayments = [...payments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Alerts for PDCs due today or overdue
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const duePDCs = pdcList.filter(p => {
     if (!p.chequeDetails?.depositDate || p.chequeDetails.status !== 'Pending') return false;
     const d = new Date(p.chequeDetails.depositDate);
     d.setHours(0,0,0,0);
     return d <= today;
  });

  const handleUpdateStatus = (id: string, status: 'Cleared' | 'Bounced') => {
     if(confirm(`Are you sure you want to mark this cheque as ${status}?`)) {
        updatePaymentStatus(id, status);
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-900">Payments & Collections</h2>
         {duePDCs.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md flex items-center text-sm font-medium animate-pulse">
               <AlertTriangle className="h-4 w-4 mr-2" />
               {duePDCs.length} Cheques Due for Deposit Today!
            </div>
         )}
      </div>
      
      <Tabs 
         tabs={['All Payments', 'PDC Management']} 
         activeTab={activeTab} 
         onTabChange={setActiveTab} 
      />

      {activeTab === 'All Payments' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
           <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                 </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                 {sortedPayments.map(p => {
                    const cust = customers.find(c => c.id === p.customerId);
                    const inv = invoices.find(i => i.id === p.invoiceId);
                    
                    let modeDisplay: React.ReactNode = p.mode;
                    if (p.mode === 'Cheque' && p.chequeDetails) {
                       const statusColor = p.chequeDetails.status === 'Cleared' ? 'text-green-600' 
                                         : p.chequeDetails.status === 'Bounced' ? 'text-red-600' : 'text-orange-500';
                       modeDisplay = (
                          <div>
                             <span className="block">Cheque #{p.chequeDetails.chequeNumber}</span>
                             <span className={`text-xs font-bold ${statusColor}`}>({p.chequeDetails.status})</span>
                          </div>
                       );
                    }

                    return (
                       <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{p.date}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{cust?.companyName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{inv?.invoiceNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{modeDisplay}</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-green-600">{settings.currency} {p.amount.toLocaleString()}</td>
                       </tr>
                    )
                 })}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'PDC Management' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdcList.length === 0 ? <p className="col-span-3 text-center text-gray-500 py-10">No pending or bounced cheques found.</p> : pdcList.map(p => {
               const cust = customers.find(c => c.id === p.customerId);
               const depositDate = new Date(p.chequeDetails!.depositDate);
               const isDue = depositDate <= new Date() && p.chequeDetails?.status === 'Pending';
               const isBounced = p.chequeDetails?.status === 'Bounced';

               return (
                  <div key={p.id} className={`bg-white p-5 rounded-lg border-l-4 shadow-sm ${isBounced ? 'border-gray-500 bg-gray-50 opacity-75' : (isDue ? 'border-red-500 ring-2 ring-red-100' : 'border-blue-500')}`}>
                     <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-700">{cust?.companyName}</span>
                        <span className="font-bold text-lg">{settings.currency} {p.amount.toLocaleString()}</span>
                     </div>
                     <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Bank:</span> {p.chequeDetails?.bankName}</p>
                        <p><span className="font-medium">Cheque #:</span> {p.chequeDetails?.chequeNumber}</p>
                        <div className={`mt-3 flex items-center ${isDue ? 'text-red-600 font-bold' : isBounced ? 'text-gray-500' : 'text-blue-600'}`}>
                           {isBounced ? <XCircle className="h-4 w-4 mr-1"/> : <Calendar className="h-4 w-4 mr-1" />}
                           {isBounced ? 'BOUNCED' : `Deposit Date: ${p.chequeDetails?.depositDate}`}
                        </div>
                     </div>
                     {p.chequeDetails?.status === 'Pending' && (
                        <div className="mt-4 flex gap-2">
                           <Button variant="primary" className="text-xs w-full flex items-center justify-center" onClick={() => handleUpdateStatus(p.id, 'Cleared')}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Mark Cleared
                           </Button>
                           <Button variant="danger" className="text-xs w-full flex items-center justify-center" onClick={() => handleUpdateStatus(p.id, 'Bounced')}>
                              <XCircle className="h-3 w-3 mr-1" /> Bounced
                           </Button>
                        </div>
                     )}
                     {p.chequeDetails?.status === 'Bounced' && (
                        <div className="mt-4 text-xs text-red-600 font-bold text-center border-t pt-2">
                           Action Required: Contact Client
                        </div>
                     )}
                  </div>
               )
            })}
         </div>
      )}
    </div>
  );
};
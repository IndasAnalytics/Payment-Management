

import React, { useState } from 'react';
import { Plus, Filter, Wallet, Phone, Eye, Mail, AlertTriangle, Send, Link as LinkIcon, Calendar, MessageSquare, Printer, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Button, InputGroup, StatusBadge } from '../../components/UI';
import { Invoice, JobType, InvoiceStatus } from '../../types';

export const Invoices = () => {
  const { invoices, customers, addInvoice, updateInvoice, deleteInvoice, addPayment, addFollowUp, settings } = useApp();
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('All');

  // New Invoice Form
  const [invForm, setInvForm] = useState({
    invoiceNumber: '', date: '', dueDate: '', customerId: '', 
    jobName: '', jobType: JobType.Offset, amount: 0, notes: '', currency: settings.currency
  });

  // Payment Form
  const [payForm, setPayForm] = useState({
    amount: 0, mode: 'NEFT', date: new Date().toISOString().split('T')[0],
    chequeNumber: '', bankName: '', depositDate: ''
  });

  // Follow Up Form
  const initialFollowUpForm = {
    customerId: '', invoiceId: '', date: new Date().toISOString().split('T')[0],
    mode: 'Call', status: 'Promised', contactPerson: '', notes: '', nextFollowUpDate: ''
  };
  const [fuForm, setFuForm] = useState(initialFollowUpForm);

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Unpaid') return inv.status !== InvoiceStatus.Paid;
    return inv.status === filterStatus;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    addInvoice({
      id: Date.now().toString(),
      ...invForm,
      paidAmount: 0,
      status: InvoiceStatus.Pending,
      payments: []
    });
    setIsInvoiceModalOpen(false);
    setInvForm({
      invoiceNumber: '', date: '', dueDate: '', customerId: '', 
      jobName: '', jobType: JobType.Offset, amount: 0, notes: '', currency: settings.currency
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if(confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice(id);
      if(isViewModalOpen) setIsViewModalOpen(false);
    }
  }

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if(selectedInvoiceId) {
       const inv = invoices.find(i => i.id === selectedInvoiceId);
       if (!inv) return;
       
      const paymentData: any = {
        id: Date.now().toString(),
        invoiceId: selectedInvoiceId,
        customerId: inv.customerId,
        amount: payForm.amount,
        mode: payForm.mode,
        date: payForm.date
      };

      if (payForm.mode === 'Cheque') {
        paymentData.chequeDetails = {
          chequeNumber: payForm.chequeNumber,
          bankName: payForm.bankName,
          depositDate: payForm.depositDate,
          status: 'Pending'
        };
      }

      addPayment(paymentData);
    }
    setIsPaymentModalOpen(false);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFollowUp({
      id: Date.now().toString(),
      ...fuForm,
      mode: fuForm.mode as any,
      status: fuForm.status as any,
      contactPerson: fuForm.contactPerson || 'Client',
      userId: 'u1'
    });
    setIsFollowUpModalOpen(false);
  };

  const openFollowUpModal = (invoice: Invoice) => {
     setFuForm({
        ...initialFollowUpForm,
        customerId: invoice.customerId,
        invoiceId: invoice.id
     });
     setIsFollowUpModalOpen(true);
  };

  const triggerReminder = (invoice: Invoice, type: 'WhatsApp' | 'Email') => {
    alert(`Simulated ${type} sent for invoice #${invoice.invoiceNumber}`);
    // Log interaction
    addFollowUp({
      id: Date.now().toString(),
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      date: new Date().toISOString().split('T')[0],
      mode: type === 'WhatsApp' ? 'WhatsApp' : 'Email',
      status: 'Sent',
      notes: `Manual ${type} reminder sent.`,
      contactPerson: 'System',
      userId: 'u1'
    });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getDaysOverdue = (inv: Invoice) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(inv.dueDate); due.setHours(0,0,0,0);
    if(today <= due) return 0;
    const diffTime = Math.abs(today.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Management</h2>
        <div className="flex gap-2">
           <select 
             className="border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">All Status</option>
             <option value="Unpaid">Unpaid (Pending + Overdue)</option>
             <option value={InvoiceStatus.Overdue}>Overdue</option>
             <option value={InvoiceStatus.Pending}>Pending</option>
             <option value={InvoiceStatus.PartiallyPaid}>Partially Paid</option>
             <option value={InvoiceStatus.Paid}>Paid</option>
           </select>
          <Button onClick={() => setIsInvoiceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2 inline" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-x-auto rounded-lg print:shadow-none">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Balance</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.map((inv) => {
              const cust = customers.find(c => c.id === inv.customerId);
              const balance = inv.amount - inv.paidAmount;
              const overdueDays = getDaysOverdue(inv);
              
              return (
                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {inv.invoiceNumber}
                    <div className="text-xs text-gray-400 font-normal">{inv.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cust?.companyName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-32">{inv.jobName}</div>
                    <div className="text-xs text-gray-400">{inv.jobType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {inv.dueDate}
                    {overdueDays > 0 && balance > 0 && (
                      <div className="text-red-600 dark:text-red-400 text-xs font-bold mt-1">
                         +{overdueDays} Days
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={balance === 0 ? InvoiceStatus.Paid : (overdueDays > 0 ? InvoiceStatus.Overdue : inv.status)} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{settings.currency} {balance.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total: {inv.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium print:hidden">
                     <button onClick={() => { setViewInvoice(inv); setIsViewModalOpen(true); }} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                        <Eye className="h-4 w-4" />
                     </button>
                     {balance > 0 && (
                        <button 
                          onClick={() => { setSelectedInvoiceId(inv.id); setPayForm({...payForm, amount: balance, mode: 'NEFT', chequeNumber:'', depositDate:'', bankName:''}); setIsPaymentModalOpen(true); }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                        >
                          <Wallet className="h-4 w-4" />
                        </button>
                     )}
                     <button onClick={() => handleDeleteInvoice(inv.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Create New Invoice">
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Invoice No" value={invForm.invoiceNumber} onChange={(e:any) => setInvForm({...invForm, invoiceNumber: e.target.value})} required />
            <InputGroup label="Date" type="date" value={invForm.date} onChange={(e:any) => setInvForm({...invForm, date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
            <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={invForm.customerId} onChange={(e) => setInvForm({...invForm, customerId: e.target.value})} required>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Job Description" value={invForm.jobName} onChange={(e:any) => setInvForm({...invForm, jobName: e.target.value})} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={invForm.jobType} onChange={(e) => setInvForm({...invForm, jobType: e.target.value as JobType})}>
                {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Amount" type="number" value={invForm.amount} onChange={(e:any) => setInvForm({...invForm, amount: Number(e.target.value)})} required />
            <InputGroup label="Due Date" type="date" value={invForm.dueDate} onChange={(e:any) => setInvForm({...invForm, dueDate: e.target.value})} required />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <InputGroup label="Amount Received" type="number" value={payForm.amount} onChange={(e:any) => setPayForm({...payForm, amount: Number(e.target.value)})} required />
          <InputGroup label="Date" type="date" value={payForm.date} onChange={(e:any) => setPayForm({...payForm, date: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
            <select className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={payForm.mode} onChange={(e) => setPayForm({...payForm, mode: e.target.value})}>
              <option>NEFT</option>
              <option>Cheque</option>
              <option>Cash</option>
              <option>UPI</option>
            </select>
          </div>
          {payForm.mode === 'Cheque' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md border border-yellow-200 dark:border-yellow-800 space-y-3">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center"><Calendar className="h-4 w-4 mr-1"/> PDC Details</h4>
              <InputGroup label="Cheque Number" value={payForm.chequeNumber} onChange={(e:any) => setPayForm({...payForm, chequeNumber: e.target.value})} required />
              <InputGroup label="Bank Name" value={payForm.bankName} onChange={(e:any) => setPayForm({...payForm, bankName: e.target.value})} required />
              <InputGroup label="Deposit Date" type="date" value={payForm.depositDate} onChange={(e:any) => setPayForm({...payForm, depositDate: e.target.value})} required />
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Payment</Button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewInvoice ? `Invoice #${viewInvoice.invoiceNumber}` : ''}>
         {viewInvoice && (
           <div className="space-y-6">
              <div className="flex justify-between print:hidden">
                 <div>
                    <h3 className="font-bold text-lg">{customers.find(c => c.id === viewInvoice.customerId)?.companyName}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{viewInvoice.jobName} ({viewInvoice.jobType})</p>
                 </div>
                 <div className="text-right">
                    <StatusBadge status={viewInvoice.status} />
                    <p className="text-lg font-bold mt-2">{settings.currency} {(viewInvoice.amount - viewInvoice.paidAmount).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Balance Due</p>
                 </div>
              </div>

              {/* Print View Header (Only Visible on Print) */}
              <div className="hidden print:block text-center mb-8 text-black">
                 <h1 className="text-2xl font-bold">{settings.name}</h1>
                 <p>{settings.address} | {settings.phone}</p>
                 <h2 className="text-xl font-bold mt-4 uppercase">Invoice</h2>
              </div>

              <div className="flex gap-4 border-t border-b dark:border-gray-700 py-4 overflow-x-auto print:hidden">
                 <Button variant="whatsapp" className="flex-1 whitespace-nowrap" onClick={() => triggerReminder(viewInvoice, 'WhatsApp')}>
                    <Send className="h-4 w-4 mr-2" /> WhatsApp
                 </Button>
                 <Button variant="outline" className="flex-1 whitespace-nowrap" onClick={() => triggerReminder(viewInvoice, 'Email')}>
                    <Mail className="h-4 w-4 mr-2" /> Email
                 </Button>
                 <Button variant="primary" className="flex-1 whitespace-nowrap" onClick={() => openFollowUpModal(viewInvoice)}>
                    <Phone className="h-4 w-4 mr-2" /> Log Call
                 </Button>
                 <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={handlePrintInvoice}>
                    <Printer className="h-4 w-4 mr-2" /> Print
                 </Button>
              </div>

              <div className="hidden print:block mb-8 text-black">
                  <div className="flex justify-between">
                     <div>
                        <strong>Bill To:</strong><br/>
                        {customers.find(c => c.id === viewInvoice.customerId)?.companyName}<br/>
                        {customers.find(c => c.id === viewInvoice.customerId)?.address}<br/>
                        {customers.find(c => c.id === viewInvoice.customerId)?.city}
                     </div>
                     <div className="text-right">
                        <strong>Invoice #:</strong> {viewInvoice.invoiceNumber}<br/>
                        <strong>Date:</strong> {viewInvoice.date}<br/>
                        <strong>Due Date:</strong> {viewInvoice.dueDate}
                     </div>
                  </div>
              </div>

              <div>
                 <h4 className="font-bold text-sm mb-2 print:hidden">Payment History</h4>
                 {viewInvoice.payments.length === 0 ? <p className="text-gray-500 dark:text-gray-400 italic text-sm print:hidden">No payments yet.</p> : (
                    <ul className="divide-y border dark:border-gray-700 print:border-black">
                       <li className="bg-gray-50 dark:bg-gray-700 p-2 font-bold flex justify-between print:bg-gray-200">
                          <span>Transaction</span>
                          <span>Amount</span>
                       </li>
                       {viewInvoice.payments.map(p => (
                          <li key={p.id} className="p-2 flex justify-between text-sm border-t dark:border-gray-700">
                             <span>
                                {p.date} ({p.mode})
                                {p.mode === 'Cheque' && p.chequeDetails && (
                                   <span className={`ml-2 text-xs font-bold ${p.chequeDetails.status === 'Bounced' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                      [{p.chequeDetails.status}]
                                   </span>
                                )}
                             </span>
                             <span className="font-bold text-green-600 dark:text-green-400">{settings.currency} {p.amount.toLocaleString()}</span>
                          </li>
                       ))}
                    </ul>
                 )}
              </div>
           </div>
         )}
      </Modal>

      {/* Follow Up Modal */}
      <Modal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} title="Log Communication">
         <form onSubmit={handleFollowUpSubmit} className="space-y-4">
             <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded mb-4">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Linked Invoice</span>
                <p className="font-bold text-gray-900 dark:text-white">{invoices.find(i => i.id === fuForm.invoiceId)?.invoiceNumber}</p>
             </div>
             
            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Date" type="date" value={fuForm.date} onChange={(e:any) => setFuForm({...fuForm, date: e.target.value})} required />
               <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Mode</label>
                  <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={fuForm.mode} onChange={(e) => setFuForm({...fuForm, mode: e.target.value})}>
                     <option>Call</option>
                     <option>WhatsApp</option>
                     <option>Email</option>
                     <option>Visit</option>
                  </select>
               </div>
            </div>
            <InputGroup label="Contact Person" value={fuForm.contactPerson} onChange={(e:any) => setFuForm({...fuForm, contactPerson: e.target.value})} />
            <InputGroup label="Notes" value={fuForm.notes} onChange={(e:any) => setFuForm({...fuForm, notes: e.target.value})} required />
             <div>
               <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Outcome</label>
               <select className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={fuForm.status} onChange={(e) => setFuForm({...fuForm, status: e.target.value})}>
                  <option>Promised</option>
                  <option>Will Pay</option>
                  <option>No Answer</option>
                  <option>Dispute</option>
                  <option>Paid</option>
               </select>
            </div>
            {fuForm.status === 'Promised' && (
                 <InputGroup label="Next Follow Up" type="date" value={fuForm.nextFollowUpDate} onChange={(e:any) => setFuForm({...fuForm, nextFollowUpDate: e.target.value})} />
            )}
            
            <div className="flex justify-end pt-4 gap-2">
               <Button variant="secondary" onClick={() => setIsFollowUpModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save Log</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};
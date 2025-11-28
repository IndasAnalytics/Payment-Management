

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin, Printer, ShieldAlert, ShieldCheck, Shield, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Button, InputGroup, StatusBadge, Tabs, StarRating } from '../../components/UI';
import { Customer, JobType, InvoiceStatus } from '../../types';

export const Customers = () => {
  const { customers, invoices, followUps, payments, visits, addCustomer, deleteCustomer, updateCustomer, calculateClientScore, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showPrintStatement, setShowPrintStatement] = useState(false);

  // Form State
  const initialFormState = {
    name: '', companyName: '', email: '', mobile: '', city: '',
    creditLimit: 0, tags: [JobType.Offset], address: '', gst: '', currency: 'INR'
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        mobile: customer.mobile,
        city: customer.city,
        creditLimit: customer.creditLimit,
        tags: customer.tags,
        address: customer.address || '',
        gst: customer.gst || '',
        currency: customer.currency || 'INR'
      });
    } else {
      setEditingCustomer(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...formData });
    } else {
      addCustomer({
        id: Date.now().toString(),
        ...formData
      });
    }
    setIsModalOpen(false);
  };

  const handleView = (customer: Customer) => {
    setViewCustomer(customer);
    setActiveTab('Overview');
    setShowPrintStatement(false);
    setIsViewModalOpen(true);
  };

  const handlePrintStatement = () => {
    setShowPrintStatement(true);
    setTimeout(() => {
       window.print();
    }, 500);
  };

  const filteredCustomers = customers.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data for View Modal
  const customerInvoices = viewCustomer ? invoices.filter(i => i.customerId === viewCustomer.id) : [];
  const customerPayments = viewCustomer ? payments.filter(p => p.customerId === viewCustomer.id) : [];
  const customerFollowUps = viewCustomer ? followUps.filter(f => f.customerId === viewCustomer.id) : [];
  const customerVisits = viewCustomer ? visits.filter(v => v.customerId === viewCustomer.id) : [];
  
  const customerTotalDue = customerInvoices.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const riskAnalysis = viewCustomer ? calculateClientScore(viewCustomer.id) : { score: 5, label: '', color: '' };

  // Printable Statement Component (Inline)
  if (showPrintStatement && viewCustomer) {
    return (
      <div className="bg-white min-h-screen p-8 text-black print:block absolute inset-0 z-50">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
           <div>
              <h1 className="text-3xl font-bold">{settings.name}</h1>
              <p className="text-gray-600">{settings.address}</p>
              <p className="text-gray-600">Ph: {settings.phone}</p>
           </div>
           <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Statement of Account</h2>
              <p>Date: {new Date().toLocaleDateString()}</p>
           </div>
        </div>
        
        <div className="mb-8 flex justify-between">
           <div>
             <h3 className="font-bold text-gray-500 text-sm uppercase mb-1">Bill To:</h3>
             <p className="font-bold text-lg">{viewCustomer.companyName}</p>
             <p>{viewCustomer.address}</p>
             <p>{viewCustomer.city}</p>
             {viewCustomer.gst && <p>GST: {viewCustomer.gst}</p>}
           </div>
           <div className="text-right">
             <div className="bg-gray-100 p-4 rounded">
               <p className="text-sm font-bold text-gray-500">Total Outstanding</p>
               <p className="text-2xl font-bold">{settings.currency} {customerTotalDue.toLocaleString()}</p>
             </div>
           </div>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
               <th className="text-left py-2">Date</th>
               <th className="text-left py-2">Invoice #</th>
               <th className="text-left py-2">Description</th>
               <th className="text-right py-2">Amount</th>
               <th className="text-right py-2">Paid</th>
               <th className="text-right py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {customerInvoices.map(inv => (
              <tr key={inv.id} className="border-b border-gray-200">
                 <td className="py-2">{inv.date}</td>
                 <td className="py-2">{inv.invoiceNumber}</td>
                 <td className="py-2">{inv.jobName}</td>
                 <td className="text-right py-2">{inv.amount.toLocaleString()}</td>
                 <td className="text-right py-2">{inv.paidAmount.toLocaleString()}</td>
                 <td className="text-right py-2 font-bold">{(inv.amount - inv.paidAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
             <tr className="border-t-2 border-black font-bold text-lg">
                <td colSpan={5} className="text-right py-4">Total Outstanding:</td>
                <td className="text-right py-4">{settings.currency} {customerTotalDue.toLocaleString()}</td>
             </tr>
          </tfoot>
        </table>

        <div className="mt-12 text-center text-gray-500 text-sm">
           <p>This is a computer generated statement.</p>
        </div>
        
        <div className="print:hidden mt-8 text-center fixed bottom-10 left-0 right-0">
           <Button onClick={() => setShowPrintStatement(false)} variant="secondary" className="shadow-xl border-2 border-gray-400">Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Customer
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Profile</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Outstanding</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => {
              const risk = calculateClientScore(customer.id);
              const totalDue = invoices.filter(i => i.customerId === customer.id).reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
              
              return (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{customer.companyName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{customer.city}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{customer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{customer.mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                     risk.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                     risk.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                   }`}>
                      {risk.color === 'red' ? <ShieldAlert className="w-3 h-3 mr-1"/> : <ShieldCheck className="w-3 h-3 mr-1"/>}
                      {risk.label}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {settings.currency} {totalDue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleView(customer)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleOpenModal(customer)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteCustomer(customer.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? "Edit Customer" : "New Customer"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Company Name" value={formData.companyName} onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} required />
            <InputGroup label="Contact Person" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Email" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />
            <InputGroup label="Mobile" value={formData.mobile} onChange={(e: any) => setFormData({...formData, mobile: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="GST / Tax ID" value={formData.gst} onChange={(e: any) => setFormData({...formData, gst: e.target.value})} />
            <InputGroup label="Currency" value={formData.currency} onChange={(e: any) => setFormData({...formData, currency: e.target.value})} />
          </div>
          <InputGroup label="Address" value={formData.address} onChange={(e: any) => setFormData({...formData, address: e.target.value})} />
          <InputGroup label="City" value={formData.city} onChange={(e: any) => setFormData({...formData, city: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Credit Limit" type="number" value={formData.creditLimit} onChange={(e: any) => setFormData({...formData, creditLimit: Number(e.target.value)})} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Job Type</label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={formData.tags[0]} onChange={(e) => setFormData({...formData, tags: [e.target.value as JobType]})}>
                {Object.values(JobType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Customer</Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Client 360° View" size="xl">
        {viewCustomer && (
          <div>
             <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white">{viewCustomer.companyName}</h2>
                   <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center"><Phone className="h-4 w-4 mr-1"/> {viewCustomer.mobile}</span>
                      <span className="flex items-center"><Mail className="h-4 w-4 mr-1"/> {viewCustomer.email}</span>
                   </div>
                   <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        riskAnalysis.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                        riskAnalysis.color === 'orange' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                         AI Risk: {riskAnalysis.label} ({riskAnalysis.score.toFixed(1)}/5)
                      </span>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-sm text-gray-500 dark:text-gray-400">Total Outstanding</div>
                   <div className={`text-2xl font-bold ${customerTotalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {settings.currency} {customerTotalDue.toLocaleString()}
                   </div>
                   <div className="mt-2">
                     <Button variant="outline" className="text-xs h-8" onClick={handlePrintStatement}>
                       <Printer className="h-3 w-3 mr-1" /> Statement
                     </Button>
                   </div>
                </div>
             </div>

             <Tabs 
               tabs={['Overview', 'Invoices', 'Payments', 'Activity', 'Visits']} 
               activeTab={activeTab} 
               onTabChange={setActiveTab} 
             />

             <div className="min-h-[300px] overflow-y-auto max-h-[500px] pr-2">
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 border dark:border-gray-600 rounded-lg">
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-2">Address & Tax</h4>
                        <p className="text-sm font-medium">{viewCustomer.address || 'N/A'}</p>
                        <p className="text-sm">{viewCustomer.city}</p>
                        <p className="text-sm mt-2"><span className="font-semibold">{settings.taxLabel}:</span> {viewCustomer.gst || 'N/A'}</p>
                     </div>
                     <div className="p-4 border dark:border-gray-600 rounded-lg">
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-2">Credit Info</h4>
                        <div className="flex justify-between text-sm mb-1">
                           <span>Credit Limit:</span>
                           <span>{settings.currency} {viewCustomer.creditLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                           <span>Current Balance:</span>
                           <span className={customerTotalDue > viewCustomer.creditLimit ? 'text-red-600 font-bold' : ''}>
                             {settings.currency} {customerTotalDue.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'Invoices' && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                       <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Invoice</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Balance</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                       {customerInvoices.map(inv => (
                          <tr key={inv.id}>
                             <td className="px-4 py-2 text-sm font-medium">{inv.invoiceNumber}</td>
                             <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{inv.date}</td>
                             <td className="px-4 py-2"><StatusBadge status={inv.status} /></td>
                             <td className="px-4 py-2 text-right text-sm font-bold">{settings.currency} {(inv.amount - inv.paidAmount).toLocaleString()}</td>
                          </tr>
                       ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'Payments' && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Date</th>
                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Mode</th>
                           <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customerPayments.map(p => (
                           <tr key={p.id}>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">{p.date}</td>
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{p.mode}</td>
                              <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400 font-bold text-right">{settings.currency} {p.amount.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                )}

                {activeTab === 'Activity' && (
                  <div className="space-y-4">
                     {customerFollowUps.map(fu => (
                        <div key={fu.id} className="p-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                           <div className="flex justify-between mb-1">
                              <span className="font-bold text-sm">{fu.date}</span>
                              <span className="text-xs uppercase bg-white dark:bg-gray-600 border dark:border-gray-500 px-1 rounded">{fu.mode}</span>
                           </div>
                           <p className="text-sm text-gray-700 dark:text-gray-300">{fu.notes}</p>
                           <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Status: {fu.status}</div>
                        </div>
                     ))}
                  </div>
                )}
                
                {activeTab === 'Visits' && (
                  <div className="space-y-4">
                     {customerVisits.map(v => (
                        <div key={v.id} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
                           <div className="flex justify-between mb-1">
                              <span className="font-bold text-sm text-blue-900 dark:text-blue-200">{v.date}</span>
                              <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-1 rounded">Visit</span>
                           </div>
                           <p className="text-sm font-semibold">{v.purpose}</p>
                           <p className="text-sm text-gray-700 dark:text-gray-300">{v.notes}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center"><MapPin className="h-3 w-3 mr-1"/> {v.location}</p>
                        </div>
                     ))}
                     {customerVisits.length === 0 && <p className="text-center text-gray-500 italic">No field visits recorded.</p>}
                  </div>
                )}
             </div>

             <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Phone, MessageSquare, Mail, MapPin, Plus, Search, 
  Clock, ArrowRight, User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Button, InputGroup, Tabs } from '../../components/UI';
import { FollowUp } from '../../types';

export const FollowUps = () => {
  const { followUps, visits, customers, invoices, addFollowUp, addVisit } = useApp();
  
  const [activeTab, setActiveTab] = useState('Remote (Calls/Msg)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  // --- Follow Up Form ---
  const initialFollowUpForm = {
    customerId: '', invoiceId: '', date: new Date().toISOString().split('T')[0],
    mode: 'Call', status: 'Promised', contactPerson: '', notes: '', nextFollowUpDate: ''
  };
  const [fuForm, setFuForm] = useState(initialFollowUpForm);

  // --- Visit Form ---
  const initialVisitForm = {
    customerId: '', date: new Date().toISOString().split('T')[0],
    purpose: '', notes: '', location: ''
  };
  const [visitForm, setVisitForm] = useState(initialVisitForm);


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
    setIsModalOpen(false);
    setFuForm(initialFollowUpForm);
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     addVisit({
        id: Date.now().toString(),
        userId: 'u1',
        ...visitForm
     });
     setIsVisitModalOpen(false);
     setVisitForm(initialVisitForm);
  };

  const filteredFollowUps = followUps.filter(f => {
     const c = customers.find(cust => cust.id === f.customerId);
     return c?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredVisits = visits.filter(v => {
     const c = customers.find(cust => cust.id === v.customerId);
     return c?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Communication & Field Logs</h2>
        <div className="flex gap-2">
           {activeTab === 'Remote (Calls/Msg)' ? (
             <Button onClick={() => setIsModalOpen(true)}>
               <Plus className="h-4 w-4 mr-2 inline" /> Log Call/Msg
             </Button>
           ) : (
             <Button onClick={() => setIsVisitModalOpen(true)}>
               <Plus className="h-4 w-4 mr-2 inline" /> Log Field Visit
             </Button>
           )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
         <div className="relative mb-4">
            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
         </div>
         
         <Tabs tabs={['Remote (Calls/Msg)', 'Field Visits']} activeTab={activeTab} onTabChange={setActiveTab} />
         
         {activeTab === 'Remote (Calls/Msg)' && (
            <div className="space-y-4 mt-4">
               {filteredFollowUps.map(f => {
                  const c = customers.find(cust => cust.id === f.customerId);
                  const i = invoices.find(inv => inv.id === f.invoiceId);
                  return (
                     <div key={f.id} className="p-4 border rounded bg-gray-50 flex gap-4">
                        <div className={`p-3 rounded-full h-12 w-12 flex items-center justify-center ${f.mode === 'Call' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                           {f.mode === 'Call' ? <Phone className="h-5 w-5"/> : f.mode === 'WhatsApp' ? <MessageSquare className="h-5 w-5"/> : <Mail className="h-5 w-5"/>}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between">
                              <h4 className="font-bold text-gray-900">{c?.companyName}</h4>
                              <span className="text-xs text-gray-500">{f.date}</span>
                           </div>
                           <p className="text-sm text-gray-800">{f.notes}</p>
                           <div className="flex gap-2 mt-2 text-xs">
                              <span className="bg-white border px-1 rounded">Person: {f.contactPerson}</span>
                              <span className="bg-white border px-1 rounded font-medium">Status: {f.status}</span>
                              {i && <span className="bg-gray-200 px-1 rounded">Inv: {i.invoiceNumber}</span>}
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         )}

         {activeTab === 'Field Visits' && (
            <div className="space-y-4 mt-4">
               {filteredVisits.map(v => {
                  const c = customers.find(cust => cust.id === v.customerId);
                  return (
                     <div key={v.id} className="p-4 border rounded bg-indigo-50 border-indigo-100 flex gap-4">
                        <div className="p-3 rounded-full h-12 w-12 flex items-center justify-center bg-indigo-200 text-indigo-700">
                           <MapPin className="h-5 w-5"/>
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between">
                              <h4 className="font-bold text-indigo-900">{c?.companyName}</h4>
                              <span className="text-xs text-indigo-600 font-bold">{v.date}</span>
                           </div>
                           <p className="text-sm font-semibold mt-1">{v.purpose}</p>
                           <p className="text-sm text-gray-700 italic">"{v.notes}"</p>
                           <p className="text-xs text-gray-500 mt-2 flex items-center"><MapPin className="h-3 w-3 mr-1"/> {v.location}</p>
                        </div>
                     </div>
                  )
               })}
            </div>
         )}
      </div>

      {/* Follow Up Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Communication">
         <form onSubmit={handleFollowUpSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Customer</label>
               <select className="w-full border rounded px-3 py-2" value={fuForm.customerId} onChange={(e) => setFuForm({...fuForm, customerId: e.target.value})} required>
                  <option value="">Select</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <InputGroup label="Date" type="date" value={fuForm.date} onChange={(e:any) => setFuForm({...fuForm, date: e.target.value})} required />
               <div>
                  <label className="block text-sm font-medium mb-1">Mode</label>
                  <select className="w-full border rounded px-3 py-2" value={fuForm.mode} onChange={(e) => setFuForm({...fuForm, mode: e.target.value})}>
                     <option>Call</option>
                     <option>WhatsApp</option>
                     <option>Email</option>
                  </select>
               </div>
            </div>
            <InputGroup label="Contact Person" value={fuForm.contactPerson} onChange={(e:any) => setFuForm({...fuForm, contactPerson: e.target.value})} />
            <InputGroup label="Notes" value={fuForm.notes} onChange={(e:any) => setFuForm({...fuForm, notes: e.target.value})} required />
            <div>
               <label className="block text-sm font-medium mb-1">Outcome</label>
               <select className="w-full border rounded px-3 py-2" value={fuForm.status} onChange={(e) => setFuForm({...fuForm, status: e.target.value})}>
                  <option>Promised</option>
                  <option>Will Pay</option>
                  <option>No Answer</option>
                  <option>Dispute</option>
               </select>
            </div>
            <div className="flex justify-end pt-4 gap-2">
               <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save</Button>
            </div>
         </form>
      </Modal>

      {/* Visit Modal */}
      <Modal isOpen={isVisitModalOpen} onClose={() => setIsVisitModalOpen(false)} title="Log Field Visit">
         <form onSubmit={handleVisitSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Customer</label>
               <select className="w-full border rounded px-3 py-2" value={visitForm.customerId} onChange={(e) => setVisitForm({...visitForm, customerId: e.target.value})} required>
                  <option value="">Select</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
               </select>
            </div>
            <InputGroup label="Date" type="date" value={visitForm.date} onChange={(e:any) => setVisitForm({...visitForm, date: e.target.value})} required />
            <InputGroup label="Purpose" value={visitForm.purpose} onChange={(e:any) => setVisitForm({...visitForm, purpose: e.target.value})} placeholder="e.g. Payment Collection" required />
            <InputGroup label="Location / Area" value={visitForm.location} onChange={(e:any) => setVisitForm({...visitForm, location: e.target.value})} placeholder="e.g. Okhla Phase 3" />
            <div className="mb-4">
               <label className="block text-sm font-medium mb-1">Visit Notes</label>
               <textarea className="w-full border rounded px-3 py-2" rows={3} value={visitForm.notes} onChange={(e) => setVisitForm({...visitForm, notes: e.target.value})} required />
            </div>
            <div className="flex justify-end pt-4 gap-2">
               <Button variant="secondary" onClick={() => setIsVisitModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save Visit</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

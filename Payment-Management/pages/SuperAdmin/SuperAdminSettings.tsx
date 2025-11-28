
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Key, CreditCard } from 'lucide-react';
import { Button, InputGroup, Card, Modal } from '../../components/UI';
import { SubscriptionPlan } from '../../types';

export const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('gateway');
  const [keys, setKeys] = useState({ razorpayKeyId: '', razorpayKeySecret: '' });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  
  // New Plan Form
  const [newPlan, setNewPlan] = useState({
    name: '', price: 0, duration: 30, razorpayPlanId: '', description: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch Data on Load
  useEffect(() => {
    fetchSettings();
    fetchPlans();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/admin/settings');
        const data = await res.json();
        setKeys(data);
    } catch (err) { console.error("Failed to load settings"); }
  };

  const fetchPlans = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/admin/plans');
        const data = await res.json();
        setPlans(data);
    } catch (err) { console.error("Failed to load plans"); }
  };

  const handleSaveKeys = async () => {
    setIsLoading(true);
    try {
        await fetch('http://localhost:5000/api/admin/settings', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(keys)
        });
        setMessage('Gateway keys saved successfully.');
    } catch (err) {
        setMessage('Failed to save keys.');
    }
    setIsLoading(false);
  };

  const handleSavePlan = async () => {
    if (!newPlan.razorpayPlanId.startsWith('plan_')) {
        alert("Razorpay Plan ID must start with 'plan_' (e.g. plan_K12345)");
        return;
    }

    try {
        await fetch('http://localhost:5000/api/admin/plans', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newPlan)
        });
        setIsPlanModalOpen(false);
        fetchPlans(); // Refresh
        setNewPlan({ name: '', price: 0, duration: 30, razorpayPlanId: '', description: '' });
    } catch (err) {
        alert('Failed to create plan');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Console</h1>
            <p className="text-gray-500">Manage Billing & Gateway Configurations</p>
        </div>
        {message && <span className="text-green-600 font-medium animate-pulse">{message}</span>}
      </div>

      <div className="flex gap-4">
        <button 
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'gateway' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
            <Key className="w-4 h-4" /> Gateway Config
        </button>
        <button 
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'plans' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
            <CreditCard className="w-4 h-4" /> Plan Manager
        </button>
      </div>

      {activeTab === 'gateway' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Key className="w-5 h-5 mr-2 text-yellow-500" /> Razorpay API Keys</h3>
            <div className="space-y-4 max-w-2xl">
                <InputGroup 
                    label="Key ID" 
                    value={keys.razorpayKeyId} 
                    onChange={(e:any) => setKeys({...keys, razorpayKeyId: e.target.value})}
                    placeholder="rzp_live_..."
                />
                <InputGroup 
                    label="Key Secret" 
                    type="password"
                    value={keys.razorpayKeySecret} 
                    onChange={(e:any) => setKeys({...keys, razorpayKeySecret: e.target.value})}
                    placeholder="xxxxxxxxxxxxxxxx"
                />
                <div className="pt-4">
                    <Button onClick={handleSaveKeys} disabled={isLoading}>
                        <Save className="w-4 h-4 mr-2" /> 
                        {isLoading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Subscription Plans</h3>
                <Button onClick={() => setIsPlanModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create New Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-t-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xl">{plan.name}</h4>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                        </div>
                        <div className="mt-4">
                            <span className="text-3xl font-bold">₹{plan.price}</span>
                            <span className="text-gray-500"> / {plan.duration} days</span>
                        </div>
                        <p className="text-gray-500 mt-2 text-sm">{plan.description}</p>
                        <div className="mt-4 pt-4 border-t text-xs text-gray-400 font-mono">
                            Razorpay ID: {plan.razorpayPlanId}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title="Create Subscription Plan">
         <div className="space-y-4">
            <InputGroup label="Plan Name" value={newPlan.name} onChange={(e:any) => setNewPlan({...newPlan, name: e.target.value})} placeholder="e.g. Pro Plan" />
            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Price (INR)" type="number" value={newPlan.price} onChange={(e:any) => setNewPlan({...newPlan, price: Number(e.target.value)})} />
                <InputGroup label="Duration (Days)" type="number" value={newPlan.duration} onChange={(e:any) => setNewPlan({...newPlan, duration: Number(e.target.value)})} />
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <label className="block text-sm font-medium mb-1">Razorpay Plan ID</label>
                <input 
                    className="w-full border rounded px-3 py-2 text-sm font-mono"
                    value={newPlan.razorpayPlanId}
                    onChange={(e:any) => setNewPlan({...newPlan, razorpayPlanId: e.target.value})}
                    placeholder="plan_K12345678"
                />
                <p className="text-xs text-yellow-700 mt-1">
                    * You must create a Plan in Razorpay Dashboard first -> Subscriptions -> Plans -> Create Plan. Copy the Plan ID here.
                </p>
            </div>
            <InputGroup label="Description" value={newPlan.description} onChange={(e:any) => setNewPlan({...newPlan, description: e.target.value})} />
            
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setIsPlanModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSavePlan}>Create Plan</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};
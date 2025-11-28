
import React, { useState, useEffect } from 'react';
import { Check, Shield, Star, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const Subscription = () => {
    const { currentUser } = useApp();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/plans');
                const data = await res.json();
                setPlans(data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchPlans();
    }, []);

    const handleSubscribe = async (plan: SubscriptionPlan) => {
        if (!currentUser?.email) return alert('Please login first');

        try {
            // 1. Create Subscription via Backend
            const res = await fetch('http://localhost:5000/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id, // Internal ID
                    userEmail: currentUser.email
                })
            });

            const data = await res.json();
            if (!data.subscription_id) throw new Error('Failed to init subscription');

            // 2. Open Razorpay Checkout
            const options = {
                key: data.key_id,
                subscription_id: data.subscription_id,
                name: "PrintPay SaaS",
                description: `Upgrade to ${plan.name}`,
                handler: async function (response: any) {
                    // 3. Verify Payment on Backend
                    const verifyRes = await fetch('http://localhost:5000/api/verify-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id,
                            userEmail: currentUser.email
                        })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert('Subscription Activated Successfully!');
                        window.location.reload();
                    } else {
                        alert('Verification Failed.');
                    }
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email
                },
                theme: {
                    color: "#2563eb"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (err) {
            console.error(err);
            alert('Something went wrong initiating payment.');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Plans...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Upgrade Your Plan</h1>
                <p className="text-gray-500 text-lg">
                    Unlock advanced features like WhatsApp automation, unlimited invoices, and multi-user support.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {/* Free Plan (Hardcoded Visual) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-extrabold tracking-tight">Free</span>
                    </div>
                    <ul className="mt-6 space-y-4 flex-1">
                        {['100 Clients', 'Basic Invoicing', 'Email Support'].map((feature) => (
                            <li key={feature} className="flex">
                                <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                                <span className="ml-3 text-gray-500">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <button disabled className="mt-8 bg-gray-100 text-gray-500 w-full py-3 rounded-lg font-medium cursor-not-allowed">
                        Current Plan
                    </button>
                </div>

                {/* Dynamic Plans */}
                {plans.map((plan) => (
                    <div key={plan.id} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-blue-500 p-8 flex flex-col transform hover:-translate-y-1 transition-transform duration-200">
                        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-32 h-32 overflow-hidden rounded-tr-2xl">
                             <div className="absolute transform rotate-45 bg-blue-500 text-white text-xs font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center">
                                 RECOMMENDED
                             </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {plan.name} <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                        </h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-extrabold tracking-tight">₹{plan.price}</span>
                            <span className="ml-1 text-xl text-gray-500">/{plan.duration < 32 ? 'mo' : 'yr'}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

                        <ul className="mt-6 space-y-4 flex-1">
                            {['Unlimited Clients', 'WhatsApp Reminders', 'PDC Tracking', 'Priority Support'].map((feature) => (
                                <li key={feature} className="flex">
                                    <Check className="flex-shrink-0 w-5 h-5 text-blue-500" />
                                    <span className="ml-3 text-gray-500">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => handleSubscribe(plan)}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-medium shadow-md transition-colors"
                        >
                            Upgrade Now
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 flex items-start gap-4">
                <Shield className="w-10 h-10 text-green-600 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Secure Payments via Razorpay</h4>
                    <p className="text-sm text-gray-500 mt-1">
                        All subscriptions are handled securely by Razorpay. You can cancel anytime from your profile settings. 
                        We do not store your card details.
                    </p>
                </div>
            </div>
        </div>
    );
};
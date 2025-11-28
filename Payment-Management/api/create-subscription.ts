
import { getDB, sql } from './db';
import { getRazorpayInstance, getRazorpayKeys } from './razorpayUtils';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { planId, userEmail } = req.body;

    try {
        const pool = await getDB();
        
        // 1. Fetch Plan Details
        const planResult = await pool.request()
            .input('id', sql.NVarChar, planId)
            .query("SELECT RazorpayPlanId FROM SubscriptionPlans WHERE Id = @id");
        
        if (planResult.recordset.length === 0) return res.status(404).json({ message: "Plan not found" });
        
        const razorpayPlanId = planResult.recordset[0].RazorpayPlanId;

        // 2. Initialize Razorpay
        const instance = await getRazorpayInstance();

        // 3. Create Subscription
        const subscription = await instance.subscriptions.create({
            plan_id: razorpayPlanId,
            customer_notify: 1,
            total_count: 120, 
            quantity: 1,
            notes: { user_email: userEmail }
        });

        // 4. Return sub_id
        const keys = await getRazorpayKeys();
        return res.status(200).json({
            subscription_id: subscription.id,
            key_id: keys.id
        });

    } catch (err: any) {
        console.error("Subscription Create Error:", err);
        return res.status(500).json({ error: err.message });
    }
}

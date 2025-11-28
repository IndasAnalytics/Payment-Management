
import { getDB, sql } from './db';
import { getRazorpayKeys } from './razorpayUtils';
import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { 
        razorpay_payment_id, 
        razorpay_subscription_id, 
        razorpay_signature,
        planId,
        userEmail 
    } = req.body;

    try {
        const keys = await getRazorpayKeys();
        const secret = keys.secret;

        // 1. Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_payment_id + '|' + razorpay_subscription_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // 2. Update DB
        const pool = await getDB();
        
        // This is a simplified SaaS Client update logic
        // In real app, check Tenants table
        const query = `
            IF EXISTS (SELECT 1 FROM Tenants WHERE Email = @email)
            BEGIN
                UPDATE Tenants SET 
                    RazorpaySubscriptionId = @subId, 
                    SubscriptionStatus = 'active', 
                    PlanId = @planId,
                    CurrentPeriodEnd = DATEADD(month, 1, GETDATE())
                WHERE Email = @email
            END
        `;

        await pool.request()
            .input('email', sql.NVarChar, userEmail)
            .input('subId', sql.NVarChar, razorpay_subscription_id)
            .input('planId', sql.NVarChar, planId)
            .query(query);

        return res.status(200).json({ success: true, message: 'Subscription activated' });

    } catch (err: any) {
        console.error("Verification Error:", err);
        return res.status(500).json({ error: err.message });
    }
}

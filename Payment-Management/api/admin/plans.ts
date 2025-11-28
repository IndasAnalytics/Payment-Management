
import { getDB, sql } from '../db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const pool = await getDB();

        if (req.method === 'GET') {
            const result = await pool.request().query("SELECT * FROM SubscriptionPlans WHERE IsActive = 1");
            const plans = result.recordset.map((row: any) => ({
                id: row.Id,
                name: row.Name,
                price: row.Price,
                duration: row.Duration,
                razorpayPlanId: row.RazorpayPlanId,
                description: row.Description,
                isActive: row.IsActive
            }));
            return res.status(200).json(plans);
        }

        if (req.method === 'POST') {
            const { name, price, duration, razorpayPlanId, description } = req.body;
            const id = 'plan_' + Date.now();
            
            await pool.request()
                .input('id', sql.NVarChar, id)
                .input('name', sql.NVarChar, name)
                .input('price', sql.Decimal, price)
                .input('duration', sql.Int, duration)
                .input('pid', sql.NVarChar, razorpayPlanId)
                .input('desc', sql.NVarChar, description)
                .query(`INSERT INTO SubscriptionPlans (Id, Name, Price, Duration, RazorpayPlanId, Description) 
                        VALUES (@id, @name, @price, @duration, @pid, @desc)`);
            
            return res.status(201).json({ message: 'Plan created' });
        }

        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (err: any) {
        console.error("Plans API Error", err);
        return res.status(500).json({ error: err.message });
    }
}

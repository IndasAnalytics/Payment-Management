
import { getDB, sql } from '../db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const pool = await getDB();

        if (req.method === 'GET') {
            const result = await pool.request().query("SELECT [Key], [Value] FROM SystemSettings WHERE [Key] LIKE 'RAZORPAY%'");
            let settings = { razorpayKeyId: '', razorpayKeySecret: '' };
            result.recordset.forEach((row: any) => {
                if(row.Key === 'RAZORPAY_KEY_ID') settings.razorpayKeyId = row.Value;
                if(row.Key === 'RAZORPAY_KEY_SECRET') settings.razorpayKeySecret = row.Value;
            });
            return res.status(200).json(settings);
        }

        if (req.method === 'POST') {
            const { razorpayKeyId, razorpayKeySecret } = req.body;
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                const request = new sql.Request(transaction);
                
                // Upsert Key ID
                await request.query(`
                    MERGE SystemSettings AS target
                    USING (SELECT 'RAZORPAY_KEY_ID' AS [Key], '${razorpayKeyId}' AS [Value]) AS source
                    ON (target.[Key] = source.[Key])
                    WHEN MATCHED THEN UPDATE SET target.[Value] = source.[Value]
                    WHEN NOT MATCHED THEN INSERT ([Key], [Value]) VALUES (source.[Key], source.[Value]);
                `);

                // Upsert Secret
                await request.query(`
                    MERGE SystemSettings AS target
                    USING (SELECT 'RAZORPAY_KEY_SECRET' AS [Key], '${razorpayKeySecret}' AS [Value]) AS source
                    ON (target.[Key] = source.[Key])
                    WHEN MATCHED THEN UPDATE SET target.[Value] = source.[Value]
                    WHEN NOT MATCHED THEN INSERT ([Key], [Value]) VALUES (source.[Key], source.[Value]);
                `);

                await transaction.commit();
                return res.status(200).json({ message: 'Settings saved successfully' });
            } catch (txErr) {
                await transaction.rollback();
                throw txErr;
            }
        }
        
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (err: any) {
        console.error("Settings API Error", err);
        return res.status(500).json({ error: err.message });
    }
}

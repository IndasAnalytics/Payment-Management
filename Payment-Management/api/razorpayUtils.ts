
import Razorpay from 'razorpay';
import { getDB } from './db';

// Cache keys briefly to avoid DB hits on every request
let cachedKeys = {
    id: '',
    secret: '',
    fetchedAt: 0
};

export async function getRazorpayKeys() {
    // Return cache if valid (less than 5 mins old)
    if (cachedKeys.id && (Date.now() - cachedKeys.fetchedAt < 300000)) {
        return cachedKeys;
    }

    try {
        const pool = await getDB();
        
        const result = await pool.request().query(`
            SELECT [Key], [Value] FROM SystemSettings 
            WHERE [Key] IN ('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')
        `);

        let dbKeys: Record<string, string> = {};
        result.recordset.forEach((row: any) => {
            dbKeys[row.Key] = row.Value;
        });

        if (dbKeys['RAZORPAY_KEY_ID'] && dbKeys['RAZORPAY_KEY_SECRET']) {
            cachedKeys = {
                id: dbKeys['RAZORPAY_KEY_ID'],
                secret: dbKeys['RAZORPAY_KEY_SECRET'],
                fetchedAt: Date.now()
            };
            return cachedKeys;
        }
    } catch (err) {
        console.error("Error fetching Razorpay keys from DB:", err);
    }

    // Fallback to env or null
    return {
        id: process.env.RAZORPAY_KEY_ID || '',
        secret: process.env.RAZORPAY_KEY_SECRET || ''
    };
}

export async function getRazorpayInstance() {
    const keys = await getRazorpayKeys();
    if (!keys.id || !keys.secret) {
        throw new Error("Razorpay keys not configured in SystemSettings");
    }
    return new Razorpay({
        key_id: keys.id,
        key_secret: keys.secret
    });
}

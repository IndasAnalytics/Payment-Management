
const Razorpay = require('razorpay');
const { connectDB, sql } = require('./dbConfig'); // Use existing config

// Cache keys briefly to avoid DB hits on every request (Optional, simplistic version here)
let cachedKeys = {
    id: null,
    secret: null,
    fetchedAt: 0
};

async function getRazorpayKeys() {
    // Refresh cache every 5 minutes
    if (cachedKeys.id && (Date.now() - cachedKeys.fetchedAt < 300000)) {
        return cachedKeys;
    }

    try {
        const pool = await connectDB();
        
        const result = await pool.request().query(`
            SELECT [Key], [Value] FROM SystemSettings 
            WHERE [Key] IN ('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET')
        `);

        let dbKeys = {};
        result.recordset.forEach(row => {
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

    // Fallback to env or return null
    return {
        id: process.env.RAZORPAY_KEY_ID,
        secret: process.env.RAZORPAY_KEY_SECRET
    };
}

async function getRazorpayInstance() {
    const keys = await getRazorpayKeys();
    if (!keys.id || !keys.secret) {
        throw new Error("Razorpay keys not configured in SystemSettings");
    }
    return new Razorpay({
        key_id: keys.id,
        key_secret: keys.secret
    });
}

module.exports = { getRazorpayKeys, getRazorpayInstance };
import { getDB, sql } from './db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // In a real app, you would verify the JWT token here to get TenantId
    // For now, we assume TenantId is passed in header or query for demo
    // const tenantId = req.headers['x-tenant-id']; 

    try {
        const pool = await getDB();

        if (req.method === 'GET') {
            const result = await pool.request().query('SELECT * FROM Customers');
            const customers = result.recordset.map((c: any) => ({
                ...c,
                tags: c.Tags ? c.Tags.split(',') : []
            }));
            return res.status(200).json(customers);
        }

        if (req.method === 'POST') {
            const { id, name, companyName, email, mobile, city, creditLimit, tags, address, gst } = req.body;
            
            await pool.request()
                .input('id', sql.NVarChar, id)
                .input('name', sql.NVarChar, name)
                .input('companyName', sql.NVarChar, companyName)
                .input('email', sql.NVarChar, email)
                .input('mobile', sql.NVarChar, mobile)
                .input('city', sql.NVarChar, city)
                .input('creditLimit', sql.Decimal, creditLimit)
                .input('tags', sql.NVarChar, tags.join(','))
                .input('address', sql.NVarChar, address)
                .input('gst', sql.NVarChar, gst)
                .query(`INSERT INTO Customers (Id, Name, CompanyName, Email, Mobile, City, CreditLimit, Tags, Address, GST) 
                        VALUES (@id, @name, @companyName, @email, @mobile, @city, @creditLimit, @tags, @address, @gst)`);
            
            return res.status(201).json({ message: 'Customer created' });
        }
        
        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (err: any) {
        console.error("API Error", err);
        return res.status(500).json({ error: err.message });
    }
}
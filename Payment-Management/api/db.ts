
import sql from 'mssql';

// Global cache to prevent multiple connections in Serverless environment (Hot Reloading)
const globalAny: any = globalThis;

// Singleton connection helper
export const getDB = async (): Promise<sql.ConnectionPool> => {
    // 1. Return cached connection if active
    if (globalAny.dbPool) {
        const pool = await globalAny.dbPool;
        if (pool.connected) {
            return pool;
        }
    }

    // 2. Create new connection if none exists
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is missing.');
    }

    const config: any = {
        // mssql accepts the connection string directly, or we parse it. 
        // passing string to connect() is the simplest way for connection strings.
        // However, for pool settings, we usually need an object. 
        // We will parse the string internally by mssql or just pass string.
        user: '', 
        password: '',
        server: '', 
        database: '',
        // Explicit pool settings for Serverless to prevent exhaustion
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    };

    try {
        // sql.connect can accept a connection string directly
        const poolPromise = sql.connect(connectionString).then(pool => {
            console.log('✅ Connected to MSSQL Database');
            return pool;
        });

        globalAny.dbPool = poolPromise;
        return poolPromise;
    } catch (err) {
        console.error('❌ Database Connection Failed:', err);
        throw err;
    }
};

export { sql };

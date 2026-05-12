import sql from 'mssql';
import 'dotenv/config';

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

if (process.env.DB_INSTANCE) {
    sqlConfig.options.instanceName = process.env.DB_INSTANCE;
} else {
    sqlConfig.port = parseInt(process.env.DB_PORT || 1433);
}

let poolPromise = null;

const connectDB = async () => {
    try {
        if (!poolPromise) {
            poolPromise = sql.connect(sqlConfig)
                .then(pool => {
                    console.log('Connected to SQL Server successfully');
                    return pool;
                })
                .catch(err => {
                    console.error('Database Connection Failed! Bad Config: ', err);
                    poolPromise = null;
                    throw err;
                });
        }
        return await poolPromise;
    } catch (err) {
        console.error('SQL Connection Error: ', err);
        throw err;
    }
};

export { sql, connectDB };

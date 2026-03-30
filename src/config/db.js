import 'dotenv/config'
import pkg from "pg";

const {Pool} = pkg

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL || "";
const needsSsl =
  isProduction || /sslmode=require/i.test(connectionString);

const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 15000),
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
})

pool.on("error", (err) => {
    console.error("Unexpected idle PostgreSQL client error:", err.message);
});

export {pool}  
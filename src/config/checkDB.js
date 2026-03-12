import { pool } from "../config/db.js";

export async function checkDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected! Time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }

}


export async function checkDBName() {
  const res = await pool.query("SELECT current_database()");
  console.log("Connected to database:", res.rows[0].current_database);
} 
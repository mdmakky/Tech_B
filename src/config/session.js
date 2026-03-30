import session from "express-session";
import { pool } from "./db.js";
import connectPgSimple from "connect-pg-simple";

const postgresSession = connectPgSimple(session);
const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleWare = session({
    store: new postgresSession({
        pool: pool,
        tableName: "session",
        createTableIfMissing: true,
        // Avoid writing to DB on every request; lowers pool pressure significantly.
        disableTouch: true,
        errorLog: (err) => {
            console.error("Session store error:", err.message);
        },
    }),
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    name: "tech_b.sid",
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction
    }
})

export {sessionMiddleWare}
import session from "express-session";
import { pool } from "./db.js";
import connectPgSimple from "connect-pg-simple";

const postgresSession = connectPgSimple(session);

const sessionMiddleWare = session({
    store: new postgresSession({
        pool: pool,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
})

export {sessionMiddleWare}
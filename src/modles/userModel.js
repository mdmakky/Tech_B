import { pool } from "../config/db.js";

const userModel = {
    async ensureModerationColumns() {
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false`);
    },

    async findByEmail(email){
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        return result.rows[0];
    },


    async findById(id){
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1', 
            [id] 
        ) 
        return result.rows[0];
        
    },

    async createNewUser({username, email, password}){
        const result = await pool.query(
            `INSERT INTO users (username, email, password) 
            VALUES ($1 , $2, $3) 
            RETURNING id, username, email, role`,
            [username, email, password]
        )

        return result.rows[0];
    },

    async emailExists(email){
        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        )
        return result.rows.length > 0;
    },

    async usernameExists(username){
        const result = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        )
        return result.rows.length > 0;
    }, 

    async getUserCount(){
        const result = await pool.query(
            'SELECT COUNT(*) FROM users'
        )
        return parseInt(result.rows[0].count); 
    },

    async toggleBan(userId) {
        const result = await pool.query(
            `UPDATE users
             SET is_banned = NOT COALESCE(is_banned, false), updated_at = NOW()
             WHERE id = $1 AND role <> 'admin'
             RETURNING id, username, is_banned`,
            [userId]
        );

        return result.rows[0] || null;
    },

    async toggleRestriction(userId) {
        const result = await pool.query(
            `UPDATE users
             SET is_restricted = NOT COALESCE(is_restricted, false), updated_at = NOW()
             WHERE id = $1 AND role <> 'admin'
             RETURNING id, username, is_restricted`,
            [userId]
        );

        return result.rows[0] || null;
    }
    
}

export {userModel}
import { pool } from "../config/db.js";

const userModel = {
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
    }
    
}

export {userModel}
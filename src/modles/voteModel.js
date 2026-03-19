import { pool } from "../config/db.js";

const voteModel = {
    async getUserVote(post_id , user_id){
        const result = await pool.query(
            `SELECT vote_type 
            FROM votes 
            WHERE post_id = $1 AND user_id = $2`, [post_id, user_id]
        );
        return result.rows[0]?.vote_type || null; 
    },

    async toggleVote(post_id , user_id , vote_type){
        const existing_vote = await this.getUserVote(post_id, user_id)
        if(existing_vote === vote_type){
            pool.query(`
                DELETE FROM votes WHERE post_id = $1 AND user_id = $2
                `, [post_id, user_id])
                return null;
        }
        else {
            await pool.query(
                `INSERT INTO votes (post_id, user_id, vote_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (post_id, user_id)
                DO UPDATE SET vote_type = $3`,
                [post_id, user_id, vote_type]
            )
            return vote_type;
        }
    }
}

export {voteModel}
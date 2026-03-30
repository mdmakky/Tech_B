import { pool } from "../config/db.js";

const followModel = {

    // Follow a user (ON CONFLICT DO NOTHING prevents duplicates)
    async follow(followerId, followingId) {
        await pool.query(
            `INSERT INTO follows (follower_id, following_id) 
             VALUES ($1, $2) 
             ON CONFLICT DO NOTHING`,
            [followerId, followingId]
        );
    },

    // Unfollow a user
    async unfollow(followerId, followingId) {
        await pool.query(
            `DELETE FROM follows 
             WHERE follower_id = $1 AND following_id = $2`,
            [followerId, followingId]
        );
    },

    // Check if follower is already following the target user
    async isFollowing(followerId, followingId) {
        const result = await pool.query(
            `SELECT id FROM follows 
             WHERE follower_id = $1 AND following_id = $2`,
            [followerId, followingId]
        );
        return result.rows.length > 0;
    },

    // Get total follower count for a user
    async getFollowerCount(userId) {
        const result = await pool.query(
            `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    },

    // Get total following count for a user
    async getFollowingCount(userId) {
        const result = await pool.query(
            `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
            [userId]
        );
        return parseInt(result.rows[0].count);
    }
};

export { followModel };

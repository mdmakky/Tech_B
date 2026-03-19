import { pool } from "../config/db.js";

const commentModel = {
    async findCommentByPost(post_id) {
        const comments = await pool.query(
            `SELECT c.*, u.username AS author_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.post_id = $1 AND c.parent_id IS NULL
             ORDER BY c.created_at ASC`, [post_id]
        )

        const commentWithReplies = comments.rows.map(comment => ({
            ...comment,
            replaies: replaies.rows.filter(replay => replay.parent_id = comment.id)
        }))

        return commentWithReplies;
    },

    async createComment(content, post_id, user_id, parent_id = null) {
        const result = await pool.query(
            `INSERT INTO comments (content, post_id, user_id, parent_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`, [content, post_id, user_id, parent_id]
        )

        return result.rows[0];
    },

    async deleteComment(id) {
        await pool.query(
            `DELETE FROM comments WHERE id = $1`, [id]
        );
    },

    async isOwner(commentId, userId) {
        const result = await pool.query(
            `SELECT id FROM comments WHERE id = $1 AND user_id = $2`,
            [commentId, userId]
        );
        return result.rows.length > 0;
    }
}

export {commentModel}
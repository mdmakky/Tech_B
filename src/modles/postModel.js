import { pool } from "../config/db.js";

const postModel = {


    async getAllPublished() {
        const result = await pool.query(
            `SELECT 
            p.id, p.title, p.slug, p.excerpt, p.tags,
            p.created_at, p.view_count,
            u.username AS author_name, u.id AS author_id,
            COUNT(DISTINCT c.id) AS comment_count,
            COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) AS downvotes
            FROM posts p
            JOIN users u ON p.author_id = u.id
            LEFT JOIN comments c ON c.post_id = p.id
            LEFT JOIN votes v ON v.post_id = p.id
            WHERE p.is_published = true
            GROUP BY p.id, u.username, u.id
            ORDER BY p.created_at DESC`
        );
        return result.rows;
    },

    async findPostBySlug(slug) {
        const result = await pool.query(
            `SELECT 
            p.*, u.username AS author_name, u.id AS author_id, u.bio AS author_bio,
            COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) AS upvotes,
            COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) AS downvotes
            FROM posts p 
            JOIN users u ON p.author_id = u.id 
            LEFT JOIN votes v ON v.post_id = p.id
            WHERE p.slug = $1
            GROUP BY p.id, u.username, u.id, u.bio`, [slug]
        );
        return result.rows[0];
    },

    async findPostByUser(userId) {
        const result = await pool.query(
            `SELECT id, title, slug, is_published, view_count, created_at
             FROM posts
             WHERE author_id = $1
             ORDER BY created_at DESC`, [userId]
        );
        return result.rows;
    },

    async createPost({ title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published, author_id }) {
        const result = await pool.query(
            `INSERT INTO posts 
            (title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published, author_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
            `, [title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published, author_id]
        );
        return result.rows[0];
    },

    async updatePost(id, { title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published }) {
        const result = await pool.query(
            `UPDATE posts SET
            title = $1, slug = $2, content = $3, excerpt = $4,
            meta_title = $5, meta_description = $6, meta_keywords = $7,
            tags = $8, is_published = $9, 
            updated_at = NOW()
            WHERE id = $10
            RETURNING *`, [title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published, id]
        );
        return result.rows[0];
    },

    async deletePost(id) {
        await pool.query(
            `DELETE FROM posts WHERE id = $1`, [id]
        );
    },

    async incrementViews(id) {
        await pool.query(
            `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`, [id]
        );
    },

    async togglePublish(id) {
        await pool.query(
            `UPDATE posts SET is_published = NOT is_published WHERE id = $1`,
            [id]
        );
    },

    async getCountForAdmin() {
        const result = await pool.query(
            `SELECT COUNT(*) FROM posts`
        );
        return parseInt(result.rows[0].count);
    },

    async isOwner(postId, userId) {
        const result = await pool.query(
            `SELECT id FROM posts WHERE id = $1 AND author_id = $2`,
            [postId, userId]
        );
        return result.rows.length > 0;
    }

}

export { postModel }
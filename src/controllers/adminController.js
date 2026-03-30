import { postModel } from "../modles/postModel.js";
import { userModel } from "../modles/userModel.js";
import { pool } from "../config/db.js";

const adminController = {

    // GET /admin — Admin dashboard with stats and all posts
    async dashboard(req, res) {
        try {
            const postCount = await postModel.getCountForAdmin();
            const userCount = await userModel.getUserCount();

            // Admin sees ALL posts (published + drafts) with author info and comment count
            const result = await pool.query(`
                SELECT 
                    p.id, p.title, p.slug, p.is_published, 
                    p.view_count, p.created_at,
                    u.username AS author_name,
                    COUNT(c.id) AS comment_count
                FROM posts p
                JOIN users u ON p.author_id = u.id
                LEFT JOIN comments c ON c.post_id = p.id
                GROUP BY p.id, u.username
                ORDER BY p.created_at DESC
            `);

            // Count total views across all posts
            const totalViews = result.rows.reduce((sum, p) => sum + parseInt(p.view_count || 0), 0);
            const publishedCount = result.rows.filter(p => p.is_published).length;

            res.render("admin/dashboard", {
                title: "Admin Dashboard",
                posts: result.rows,
                stats: {
                    postCount,
                    userCount,
                    publishedCount,
                    totalViews
                }
            });

        } catch (error) {
            console.log("Admin dashboard error:", error);
            res.render("error/error", {
                title: "Error",
                message: "Failed to load admin dashboard."
            });
        }
    },

    // POST /admin/posts/:id/toggle-publish — Toggle a post's published status
    async togglePublish(req, res) {
        try {
            await postModel.togglePublish(parseInt(req.params.id));
            req.session.success = "Post status updated.";
            res.redirect("/admin");
        } catch (error) {
            console.log("Toggle publish error:", error);
            req.session.error = "Failed to update post status.";
            res.redirect("/admin");
        }
    },

    // POST /admin/posts/:id/delete — Admin delete any post
    async deletePost(req, res) {
        try {
            await postModel.deletePost(parseInt(req.params.id));
            req.session.success = "Post deleted.";
            res.redirect("/admin");
        } catch (error) {
            console.log("Admin delete post error:", error);
            req.session.error = "Failed to delete post.";
            res.redirect("/admin");
        }
    }
};

export { adminController };

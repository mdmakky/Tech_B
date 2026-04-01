import { postModel } from "../modles/postModel.js";
import { userModel } from "../modles/userModel.js";
import { pool } from "../config/db.js";

const adminController = {

    // GET /admin — Admin dashboard with stats and all posts
    async dashboard(req, res) {
        try {
            await userModel.ensureModerationColumns();

            const postCount = await postModel.getCountForAdmin();
            const userCount = await userModel.getUserCount();
            const selectedAuthorId = parseInt(req.query.author_id);
            const authorFilter = Number.isNaN(selectedAuthorId) ? null : selectedAuthorId;

            const authorsResult = await pool.query(
                `SELECT id, username FROM users ORDER BY username ASC`
            );

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
                WHERE ($1::int IS NULL OR p.author_id = $1)
                GROUP BY p.id, u.username
                ORDER BY p.created_at DESC
            `, [authorFilter]);

            const usersResult = await pool.query(`
                SELECT
                    u.id,
                    u.username,
                    u.email,
                    u.role,
                    COALESCE(u.is_banned, false) AS is_banned,
                    COALESCE(u.is_restricted, false) AS is_restricted,
                    COUNT(p.id) AS post_count
                FROM users u
                LEFT JOIN posts p ON p.author_id = u.id
                GROUP BY u.id
                ORDER BY u.created_at DESC
            `);

            // Count total views across all posts
            const totalViews = result.rows.reduce((sum, p) => sum + parseInt(p.view_count || 0), 0);
            const publishedCount = result.rows.filter(p => p.is_published).length;
            const bannedCount = usersResult.rows.filter(u => u.is_banned).length;
            const restrictedCount = usersResult.rows.filter(u => u.is_restricted).length;

            res.render("admin/dashboard", {
                title: "Admin Dashboard",
                posts: result.rows,
                users: usersResult.rows,
                authors: authorsResult.rows,
                selectedAuthorId: authorFilter,
                stats: {
                    postCount,
                    userCount,
                    publishedCount,
                    totalViews,
                    bannedCount,
                    restrictedCount
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
    },

    async toggleBan(req, res) {
        try {
            await userModel.ensureModerationColumns();

            const targetUserId = parseInt(req.params.id);
            if (targetUserId === req.session.user.id) {
                req.session.error = "You cannot ban your own account.";
                return res.redirect("/admin");
            }

            const updated = await userModel.toggleBan(targetUserId);
            if (!updated) {
                req.session.error = "Unable to update user ban status.";
                return res.redirect("/admin");
            }

            req.session.success = updated.is_banned
                ? `${updated.username} has been banned.`
                : `${updated.username} has been unbanned.`;
            res.redirect("/admin");
        } catch (error) {
            console.log("Admin toggle ban error:", error);
            req.session.error = "Failed to update ban status.";
            res.redirect("/admin");
        }
    },

    async toggleRestriction(req, res) {
        try {
            await userModel.ensureModerationColumns();

            const targetUserId = parseInt(req.params.id);
            if (targetUserId === req.session.user.id) {
                req.session.error = "You cannot restrict your own account.";
                return res.redirect("/admin");
            }

            const updated = await userModel.toggleRestriction(targetUserId);
            if (!updated) {
                req.session.error = "Unable to update user restriction status.";
                return res.redirect("/admin");
            }

            req.session.success = updated.is_restricted
                ? `${updated.username} has been restricted.`
                : `${updated.username} has been unrestricted.`;
            res.redirect("/admin");
        } catch (error) {
            console.log("Admin toggle restriction error:", error);
            req.session.error = "Failed to update restriction status.";
            res.redirect("/admin");
        }
    }
};

export { adminController };

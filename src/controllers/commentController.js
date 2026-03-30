import { commentModel } from "../modles/commentModel.js";

const commentController = {

    // POST /comments/add
    // Handles both top-level comments (parent_id = null) and replies (parent_id = commentId)
    async add(req, res) {
        try {
            const { content, post_id, parent_id, post_slug } = req.body;

            if (!content || !content.trim()) {
                req.session.error = "Comment cannot be empty.";
                return res.redirect(`/posts/${post_slug}#comments`);
            }

            await commentModel.createComment(
                content.trim(),
                parseInt(post_id),
                req.session.user.id,
                parent_id ? parseInt(parent_id) : null
            );

            req.session.success = parent_id ? "Reply added!" : "Comment posted!";
            res.redirect(`/posts/${post_slug}#comments`);

        } catch (error) {
            console.log("Comment add error:", error);
            req.session.error = "Failed to add comment.";
            res.redirect("back");
        }
    },

    // POST /comments/:id/delete
    async delete(req, res) {
        try {
            const commentId = parseInt(req.params.id);
            const user = req.session.user;

            const isOwner = await commentModel.isOwner(commentId, user.id);
            if (!isOwner && user.role !== "admin") {
                req.session.error = "You cannot delete this comment.";
                return res.redirect("back");
            }

            await commentModel.deleteComment(commentId);
            req.session.success = "Comment deleted.";
            res.redirect("back");

        } catch (error) {
            console.log("Comment delete error:", error);
            req.session.error = "Failed to delete comment.";
            res.redirect("back");
        }
    }
};

export { commentController };

import { commentModel } from "../modles/commentModel.js";

function getSafeReturnTo(req, fallback) {
    const candidate = req.body?.returnTo || req.get("referer");

    if (!candidate) return fallback;
    if (candidate.startsWith("/")) return candidate;

    try {
        const parsed = new URL(candidate);
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}

const commentController = {

    // POST /comments/add
    // Handles both top-level comments (parent_id = null) and replies (parent_id = commentId)
    async add(req, res) {
        try {
            const { content, post_id, parent_id, post_slug } = req.body;
            const fallbackPath = post_slug ? `/posts/${post_slug}#comments` : "/";
            const returnTo = getSafeReturnTo(req, fallbackPath);

            if (!content || !content.trim()) {
                req.session.error = "Comment cannot be empty.";
                return res.redirect(returnTo);
            }

            await commentModel.createComment(
                content.trim(),
                parseInt(post_id),
                req.session.user.id,
                parent_id ? parseInt(parent_id) : null
            );

            req.session.success = parent_id ? "Reply added!" : "Comment posted!";
            res.redirect(returnTo);

        } catch (error) {
            console.log("Comment add error:", error);
            req.session.error = "Failed to add comment.";
            const fallbackPath = req.body?.post_slug ? `/posts/${req.body.post_slug}#comments` : "/";
            res.redirect(getSafeReturnTo(req, fallbackPath));
        }
    },

    // POST /comments/:id/delete
    async delete(req, res) {
        try {
            const commentId = parseInt(req.params.id);
            const user = req.session.user;
            const fallbackPath = req.body?.post_slug ? `/posts/${req.body.post_slug}#comments` : "/";
            const returnTo = getSafeReturnTo(req, fallbackPath);

            const isOwner = await commentModel.isOwner(commentId, user.id);
            if (!isOwner && user.role !== "admin") {
                req.session.error = "You cannot delete this comment.";
                return res.redirect(returnTo);
            }

            await commentModel.deleteComment(commentId);
            req.session.success = "Comment deleted.";
            res.redirect(returnTo);

        } catch (error) {
            console.log("Comment delete error:", error);
            req.session.error = "Failed to delete comment.";
            const fallbackPath = req.body?.post_slug ? `/posts/${req.body.post_slug}#comments` : "/";
            res.redirect(getSafeReturnTo(req, fallbackPath));
        }
    }
};

export { commentController };

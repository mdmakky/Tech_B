import { voteModel } from "../modles/voteModel.js";

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

const voteController = {

    // POST /votes/:postId/:type  (type = 'up' or 'down')
    // Toggles vote — if same vote exists it removes it, otherwise upserts
    async vote(req, res) {
        try {
            const { postId, type } = req.params;
            const returnTo = getSafeReturnTo(req, `/posts/${postId}`);

            if (!["up", "down"].includes(type)) {
                req.session.error = "Invalid vote type.";
                return res.redirect(returnTo);
            }

            if (!req.session.user) {
                req.session.error = "Please login to vote.";
                return res.redirect("/auth/login");
            }

            await voteModel.toggleVote(parseInt(postId), req.session.user.id, type);
            res.redirect(returnTo);

        } catch (error) {
            console.log("Vote error:", error);
            req.session.error = "Failed to register vote.";
            res.redirect(getSafeReturnTo(req, `/posts/${req.params.postId}`));
        }
    }
};

export { voteController };

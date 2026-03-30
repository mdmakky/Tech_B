import { voteModel } from "../modles/voteModel.js";

const voteController = {

    // POST /votes/:postId/:type  (type = 'up' or 'down')
    // Toggles vote — if same vote exists it removes it, otherwise upserts
    async vote(req, res) {
        try {
            const { postId, type } = req.params;

            if (!["up", "down"].includes(type)) {
                req.session.error = "Invalid vote type.";
                return res.redirect("back");
            }

            if (!req.session.user) {
                req.session.error = "Please login to vote.";
                return res.redirect("/auth/login");
            }

            await voteModel.toggleVote(parseInt(postId), req.session.user.id, type);
            res.redirect("back");

        } catch (error) {
            console.log("Vote error:", error);
            req.session.error = "Failed to register vote.";
            res.redirect("back");
        }
    }
};

export { voteController };

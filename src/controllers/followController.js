import { followModel } from "../modles/followModel.js";

const followController = {

    // POST /follow/:userId
    // Toggles follow — if already following, unfollows; otherwise follows
    async toggle(req, res) {
        try {
            const followerId = req.session.user.id;
            const followingId = parseInt(req.params.userId);

            // Cannot follow yourself
            if (followerId === followingId) {
                req.session.error = "You cannot follow yourself.";
                return res.redirect("back");
            }

            const alreadyFollowing = await followModel.isFollowing(followerId, followingId);

            if (alreadyFollowing) {
                await followModel.unfollow(followerId, followingId);
                req.session.success = "Unfollowed successfully.";
            } else {
                await followModel.follow(followerId, followingId);
                req.session.success = "Now following this author!";
            }

            res.redirect("back");

        } catch (error) {
            console.log("Follow toggle error:", error);
            req.session.error = "Failed to update follow status.";
            res.redirect("back");
        }
    }
};

export { followController };

import { postModel } from "../modles/postModel.js";
import { userModel } from "../modles/userModel.js";

export const userController = {

    async showProfile(req, res) {
        try {
            const userSession = req.session.user;
            if (!userSession) {
                req.session.error = "You must be logged in to view your profile.";
                return res.redirect("/auth/login");
            }

            // Fetch full user from DB to get bio, avatar, etc.
            const dbUser = await userModel.findById(userSession.id);
            if (!dbUser) {
                req.session.error = "User not found.";
                return res.redirect("/auth/login");
            }

            // Fetch user's posts
            const posts = await postModel.findPostByUser(userSession.id);
            const postsCount = posts.length;

            const user = {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email,
                role: dbUser.role,
                bio: dbUser.bio || null,
                avatar: dbUser.avatar || null,
                postsCount,
                posts
            };

            res.render("partials/profile", { title: `${user.username}'s Profile`, user });

        } catch (error) {
            console.log("Error loading profile:", error);
            res.status(500).render("error/error", {
                title: "Error",
                message: "Failed to load profile" 
            });
        }
    }

};
import { userModel } from "../modles/userModel.js";

function getSafeReturnTo(req, fallback) {
    const candidate = req.get("referer") || fallback;

    if (!candidate) return fallback;
    if (candidate.startsWith("/")) return candidate;

    try {
        const parsed = new URL(candidate);
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}

async function requireAuth(req, res, next){
    if(!req.session.user){
        req.session.returnTo = req.originalUrl
        req.session.error = "Please login to continue"
        return res.redirect('/auth/login')
    }

    const dbUser = await userModel.findById(req.session.user.id);
    if (!dbUser) {
        req.session.destroy(() => {
            res.clearCookie("connect.sid", { path: "/" });
            return res.redirect("/auth/login");
        });
        return;
    }

    if (dbUser.is_banned) {
        req.session.destroy(() => {
            res.clearCookie("connect.sid", { path: "/" });
            return res.redirect("/auth/login");
        });
        return;
    }

    req.session.user = {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role
    };

    if (dbUser.is_restricted && req.method !== "GET" && dbUser.role !== "admin") {
        req.session.error = "Your account is restricted from performing this action.";
        return res.redirect(getSafeReturnTo(req, "/"));
    }

    next()

}

export {requireAuth}
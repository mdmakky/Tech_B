import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";

const router = Router();

// All admin routes require both: authenticated + admin role
router.use(requireAuth, requireAdmin);

// GET /admin — Admin dashboard
router.get("/", adminController.dashboard);

// POST /admin/posts/:id/toggle-publish — Toggle publish status
router.post("/posts/:id/toggle-publish", adminController.togglePublish);

// POST /admin/posts/:id/delete — Delete any post
router.post("/posts/:id/delete", adminController.deletePost);

// POST /admin/users/:id/toggle-ban — Ban or unban a user
router.post("/users/:id/toggle-ban", adminController.toggleBan);

// POST /admin/users/:id/toggle-restrict — Restrict or unrestrict a user
router.post("/users/:id/toggle-restrict", adminController.toggleRestriction);

export { router };

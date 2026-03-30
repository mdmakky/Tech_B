import { Router } from "express";
import { followController } from "../controllers/followController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /follow/:userId — toggle follow/unfollow (must be logged in)
router.post("/:userId", requireAuth, followController.toggle);

export { router };

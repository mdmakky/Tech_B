import { Router } from "express";
import { commentController } from "../controllers/commentController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /comments/add — add a comment or reply (must be logged in)
router.post("/add", requireAuth, commentController.add);

// POST /comments/:id/delete — delete a comment (must be logged in)
router.post("/:id/delete", requireAuth, commentController.delete);

export { router };

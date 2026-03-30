import { Router } from "express";
import { voteController } from "../controllers/voteController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /votes/:postId/:type — toggle upvote or downvote (must be logged in)
router.post("/:postId/:type", requireAuth, voteController.vote);

export { router };

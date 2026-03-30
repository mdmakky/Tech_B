import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { userController } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", requireAuth, userController.showProfile); 

export { router };
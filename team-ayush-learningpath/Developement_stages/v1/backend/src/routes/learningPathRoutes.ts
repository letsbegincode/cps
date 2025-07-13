import express from "express";
import { saveLearningPath, getLearningPath } from "../controllers/learningPathController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Enable authentication for all learning path routes
router.use(protect);

/**
 * @route POST /api/learning-path/save
 * @desc Save user's learning path
 */
router.post("/save", saveLearningPath);

/**
 * @route GET /api/learning-path/get
 * @desc Get user's saved learning path
 */
router.get("/get", getLearningPath);

export default router; 
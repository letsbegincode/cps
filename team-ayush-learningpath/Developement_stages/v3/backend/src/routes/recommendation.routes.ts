import express from "express";
import { getRecommendation } from "../controllers/recommendationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Enable authentication for all recommendation routes
router.use(protect);

/**
 * @route GET /api/recommendation/:goalConceptId
 * @desc Get personalized shortest path recommendation for a user
 */
router.get("/:goalConceptId", getRecommendation);

export default router;

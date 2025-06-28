import express from "express";
import { getRecommendation } from "../controllers/recommendationController";
// import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Temporarily disabled authentication for testing in Postman
// router.use(protect);

/**
 * @route GET /api/recommendation/:userId/:goalConceptId
 * @desc Get personalized shortest path recommendation for a user
 */
router.get("/:userId/:goalConceptId", getRecommendation);

export default router;

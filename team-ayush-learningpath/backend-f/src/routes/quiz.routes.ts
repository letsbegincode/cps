import express from "express";
import { submitQuiz } from "../controllers/quizController";

const router = express.Router();

/**
 * @route POST /api/quiz/submit
 * @desc Submit a quiz and update mastery score
 */
router.post("/submit", submitQuiz);

export default router;

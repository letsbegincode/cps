import { Request, Response } from 'express';
import Concept from '../models/conceptModel';
import User from '../models/userModel';
import UserConceptProgress from "../models/userConceptProgress";
import { HydratedDocument } from "mongoose";

/**
 * @desc    Fetches a quiz for a concept, removing answers before sending to the client.
 * @route   GET /api/quizzes/:conceptId
 * @access  Private
 */
export const getQuizForConcept = async (req: Request, res: Response) => {
    try {
        const concept = await Concept.findById(req.params.conceptId).select('quiz');

        if (!concept || !concept.quiz || concept.quiz.length === 0) {
            return res.status(404).json({ message: 'Quiz not found for this concept.' });
        }

        // IMPORTANT: We must remove the correct answers before sending the quiz.
        const sanitizedQuiz = concept.quiz.map(q => ({
            questionText: q.questionText,
            options: q.options,
            _id: (q as any)._id, // Useful for the frontend to key on
        }));

        res.status(200).json(sanitizedQuiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Grades a quiz submission and updates the user's learning profile.
 * @route   POST /api/quizzes/submit/:conceptId
 * @access  Private
 */
// export const submitQuiz = async (req: Request, res: Response) => {
//     try {
//         const { conceptId } = req.params;
//         const { answers } = req.body; // Expects an array of chosen answer indexes, e.g., [0, 2, 1]

//         const concept = await Concept.findById(conceptId).select('quiz');
//         if (!concept || !concept.quiz) {
//             return res.status(404).json({ message: 'Concept not found.' });
//         }

//         // --- Grade the submission ---
//         let correctCount = 0;
//         const results = concept.quiz.map((question, index) => {
//             const isCorrect = question.correctAnswerIndex === answers[index];
//             if (isCorrect) correctCount++;
//             return {
//                 questionText: question.questionText,
//                 yourAnswerIndex: answers[index],
//                 correctAnswerIndex: question.correctAnswerIndex,
//                 isCorrect,
//             };
//         });

//         const score = correctCount / concept.quiz.length;

//         // --- Update user's learning profile ---
//         const user = await User.findById((req.user as any)?._id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         const profileEntryIndex = user.learningProfile.findIndex(
//             item => item.concept.toString() === conceptId
//         );
        
//         const newAttempt = {
//             score: score,
//             submittedAnswers: answers,
//             attemptedAt: new Date(),
//         };

//         if (profileEntryIndex > -1) {
//             // User has attempted this concept before, add a new attempt
//             const entry = user.learningProfile[profileEntryIndex];
//             entry.quizAttempts.push(newAttempt);
//             // Update masteryLevel to be the highest score they've achieved
//             entry.masteryLevel = Math.max(entry.masteryLevel, score);
//         } else {
//             // This is the user's first attempt for this concept
//             user.learningProfile.push({
//                 concept: concept._id,
//                 masteryLevel: score,
//                 quizAttempts: [newAttempt],
//             });
//         }
//         await user.save();

//         res.status(200).json({ score, correctCount, totalQuestions: concept.quiz.length, results });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// };


// --For Quiz Recommendation and Mastery Tracking-- 
// Interface for request body
interface SubmitQuizRequestBody {
  userId: string;
  conceptId: string;
  score: number; // 0–100
}

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, conceptId, score }: SubmitQuizRequestBody = req.body;

    if (!userId || !conceptId || typeof score !== "number") {
      res.status(400).json({ error: "Missing or invalid parameters" });
      return;
    }

    const masteryIncrement = Math.min(score / 100, 1); // Normalize score to 0–1

    // Find the user's progress document
    let userProgress = await UserConceptProgress.findOne({ userId });

    if (!userProgress) {
      // No progress doc for user, create new
      userProgress = new UserConceptProgress({
        userId,
        concepts: [{
          conceptId,
          score: masteryIncrement,
          attempts: 1,
          lastUpdated: new Date(),
        }],
      });
      await userProgress.save();
      res.status(200).json({ message: "Quiz submitted and mastery updated (new user progress)." });
      return;
    }

    // Find concept entry in user's progress
    const conceptEntry = userProgress.concepts.find((c: any) => c.conceptId.toString() === conceptId);
    const MASTERY_THRESHOLD = 0.7;
    if (conceptEntry) {
      // Average previous and new score, cap at 1
      conceptEntry.score = Math.min((conceptEntry.score + masteryIncrement) / 2, 1);
      conceptEntry.attempts = (conceptEntry.attempts || 0) + 1;
      conceptEntry.lastUpdated = new Date();
      // Mastery logic
      if (conceptEntry.score >= MASTERY_THRESHOLD) {
        if (!conceptEntry.mastered) {
          conceptEntry.mastered = true;
          conceptEntry.masteredAt = new Date();
        }
      } else {
        conceptEntry.mastered = false;
        if (conceptEntry.masteredAt) delete conceptEntry.masteredAt;
      }
    } else {
      // Add new concept progress
      const newConcept: any = {
        conceptId,
        score: masteryIncrement,
        attempts: 1,
        lastUpdated: new Date(),
      };
      if (masteryIncrement >= MASTERY_THRESHOLD) {
        newConcept.mastered = true;
        newConcept.masteredAt = new Date();
      } else {
        newConcept.mastered = false;
      }
      userProgress.concepts.push(newConcept);
    }
    await userProgress.save();
    res.status(200).json({ message: "Quiz submitted and mastery updated." });
  } catch (error: any) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};


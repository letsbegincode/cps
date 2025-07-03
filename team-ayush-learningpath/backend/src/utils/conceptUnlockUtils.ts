import Concept from '../models/conceptModel';
import UserConceptProgress from '../models/userConceptProgress';
import mongoose from 'mongoose';

/**
 * Mark a concept as mastered for a user, update mastery score, and unlock dependent concepts if all prerequisites are mastered.
 */
export async function updateMasteryAndGetUnlocks(userId: string, conceptId: string, score: number) {
  // Find or create user progress doc
  let userProgress = await UserConceptProgress.findOne({ userId });
  if (!userProgress) {
    userProgress = new UserConceptProgress({ userId, concepts: [] });
  }
  // Find or add concept progress
  let conceptProgress = userProgress.concepts.find((c: any) => c.conceptId.toString() === conceptId);
  if (!conceptProgress) {
    conceptProgress = {
      conceptId: new mongoose.Types.ObjectId(conceptId),
      score: 0,
      attempts: 0,
      lastUpdated: new Date(),
      mastered: false,
      masteredAt: null,
      achievements: [],
    };
    userProgress.concepts.push(conceptProgress);
  }
  conceptProgress.score = score;
  conceptProgress.attempts += 1;
  conceptProgress.lastUpdated = new Date();
  if (score >= 0.75) {
    conceptProgress.mastered = true;
    conceptProgress.masteredAt = new Date();
  }
  await userProgress.save();

  // Unlock dependent concepts and update DB
  const unlockedConcepts = await unlockDependentConceptsAndUpdate(userId);
  return { mastered: conceptProgress.mastered, unlockedConcepts };
}

/**
 * Unlock all concepts for which all prerequisites are mastered by the user.
 * For each newly unlocked concept, ensure a progress entry exists in UserConceptProgress.
 */
export async function unlockDependentConceptsAndUpdate(userId: string) {
  // Get all concepts
  const allConcepts = await Concept.find({});
  // Get user progress
  let userProgress = await UserConceptProgress.findOne({ userId });
  if (!userProgress) {
    userProgress = new UserConceptProgress({ userId, concepts: [] });
  }
  const masteredSet = new Set(
    (userProgress?.concepts || [])
      .filter((c: any) => c.mastered)
      .map((c: any) => c.conceptId.toString())
  );
  let unlocked: string[] = [];
  for (const concept of allConcepts) {
    const conceptIdStr = concept._id.toString();
    if (!concept.prerequisites || concept.prerequisites.length === 0) {
      unlocked.push(conceptIdStr);
      // Ensure progress entry exists
      if (!userProgress.concepts.find((c: any) => c.conceptId.toString() === conceptIdStr)) {
        userProgress.concepts.push({
          conceptId: concept._id,
          score: 0,
          attempts: 0,
          lastUpdated: new Date(),
          mastered: false,
          masteredAt: null,
          achievements: [],
        });
      }
      continue;
    }
    const allMastered = concept.prerequisites.every((prereqId: any) => masteredSet.has(prereqId.toString()));
    if (allMastered) {
      unlocked.push(conceptIdStr);
      // Ensure progress entry exists
      if (!userProgress.concepts.find((c: any) => c.conceptId.toString() === conceptIdStr)) {
        userProgress.concepts.push({
          conceptId: concept._id,
          score: 0,
          attempts: 0,
          lastUpdated: new Date(),
          mastered: false,
          masteredAt: null,
          achievements: [],
        });
      }
    }
  }
  await userProgress.save();
  return unlocked;
}

/**
 * Get all unlocked concepts for a user (for learning path display)
 */
export async function getUnlockedConcepts(userId: string) {
  return unlockDependentConceptsAndUpdate(userId);
} 
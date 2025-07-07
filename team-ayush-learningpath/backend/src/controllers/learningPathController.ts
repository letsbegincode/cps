import { Request, Response } from "express";
import User from "../models/userModel";

export const saveLearningPath = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from middleware
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Cast to any to access Mongoose document properties
    const user = req.user as any;
    const authenticatedUserId = user._id?.toString();
    if (!authenticatedUserId) {
      return res.status(401).json({ error: "Invalid user ID" });
    }

    const pathData = req.body;

    // Validate required fields
    if (!pathData.pathType || !pathData.generatedPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Update user with learning path data
    await User.findByIdAndUpdate(authenticatedUserId, {
      learningPath: {
        pathType: pathData.pathType,
        selectedGoal: pathData.selectedGoal,
        selectedConcept: pathData.selectedConcept,
        generatedPath: pathData.generatedPath,
        alternativeRoutes: pathData.alternativeRoutes || [],
        selectedRoute: pathData.selectedRoute || 0,
        savedAt: new Date()
      }
    });

    console.log('Learning path saved for user:', authenticatedUserId);

    return res.status(200).json({ 
      message: "Learning path saved successfully",
      pathData 
    });

  } catch (error: any) {
    console.error("Error saving learning path:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const getLearningPath = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from middleware
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Cast to any to access Mongoose document properties
    const user = req.user as any;
    const authenticatedUserId = user._id?.toString();
    if (!authenticatedUserId) {
      return res.status(401).json({ error: "Invalid user ID" });
    }

    // Get user with learning path
    const userDoc = await User.findById(authenticatedUserId);
    
    if (!userDoc || !userDoc.learningPath) {
      return res.status(404).json({ message: "No learning path found" });
    }

    console.log('Learning path retrieved for user:', authenticatedUserId);

    return res.status(200).json(userDoc.learningPath);

  } catch (error: any) {
    console.error("Error getting learning path:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}; 
// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/userModel';

/**
 * @desc    Get the logged-in user's complete dashboard data.
 * @route   GET /api/users/dashboard
 * @access  Private
 */
export const getDashboard = async (req: Request, res: Response) => {
    try {
        // --- THIS IS THE FIX ---
        // The 'protect' middleware has already fetched the user and attached it to the request.
        // We can use it directly instead of making another database call.
        // We just need to populate the learningProfile path on the existing user object.
        const userWithPopulatedProfile = await req.user?.populate({
            path: 'learningProfile.concept', // Go into learningProfile and populate the 'concept' field
            select: 'title description', // From the populated concept, only select these fields
        });

        if (!userWithPopulatedProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userWithPopulatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update the user's own profile details (e.g., name).
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);

        if (user) {
            user.name = req.body.name || user.name;
            // You can add other updatable fields here, for example:
            // user.email = req.body.email || user.email;
            // NOTE: Changing email would require additional verification logic.

            const updatedUser = await user.save();

            // Return the updated user data, excluding the password.
            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

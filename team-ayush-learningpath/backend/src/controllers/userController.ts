// src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/userModel';
import UserConceptProgress from '../models/userConceptProgress';
import { getUnlockedConcepts } from '../utils/conceptUnlockUtils';
import Concept from '../models/conceptModel';

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
 * @desc    Get user's concept progress
 * @route   GET /api/users/:userId/progress
 * @access  Private
 */
export const getUserProgress = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        // Debug log to ensure id consistency
        console.log('DEBUG getUserProgress:', {
          reqUser: req.user,
          reqUser_id: req.user?._id,
          reqUserId: req.user?.id,
          paramUserId: userId
        });
        
        // Check if the requesting user is accessing their own progress or is an admin
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this user\'s progress' });
        }

        const userProgress = await UserConceptProgress.findOne({ userId });
        if (!userProgress) {
            return res.status(200).json([]);
        }

        // Get unlocked concepts for this user
        const unlockedConcepts = new Set(await getUnlockedConcepts(userId));

        // For each concept, return locked status
        const progressWithLock = userProgress.concepts.map((c: any) => ({
            conceptId: c.conceptId,
            score: c.score,
            attempts: c.attempts,
            lastUpdated: c.lastUpdated,
            mastered: c.mastered,
            masteredAt: c.masteredAt,
            achievements: c.achievements,
            locked: !unlockedConcepts.has(c.conceptId.toString()),
        }));

        res.status(200).json(progressWithLock);
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

/**
 * @desc    Get user's learning analytics (dynamic stats for progress page)
 * @route   GET /api/users/:userId/analytics
 * @access  Private
 */
export const getUserAnalytics = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this user\'s analytics' });
        }

        // --- Concepts Mastered & Quiz Analytics ---
        const userProgress = await UserConceptProgress.findOne({ userId });
        // --- Study Sessions ---
        const user = await User.findById(userId).select('studySessions');

        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday as start of ISO week
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let conceptsMasteredTotal = 0;
        let conceptsMasteredThisWeek = 0;
        let masteredConceptIds: string[] = [];
        let masteredConceptIdsThisWeek: string[] = [];
        let quizzesCompletedTotal = 0;
        let quizzesCompletedThisWeek = 0;
        let allScores: number[] = [];
        let monthlyScores: number[] = [];
        if (userProgress) {
            // Concepts mastered
            conceptsMasteredTotal = userProgress.concepts.filter(c => c.mastered).length;
            conceptsMasteredThisWeek = userProgress.concepts.filter(c => c.mastered && c.masteredAt && c.masteredAt >= weekStart).length;
            masteredConceptIds = userProgress.concepts.filter(c => c.mastered).map(c => c.conceptId.toString());
            masteredConceptIdsThisWeek = userProgress.concepts.filter(c => c.mastered && c.masteredAt && c.masteredAt >= weekStart).map(c => c.conceptId.toString());
            // Quizzes completed: concepts with attempts > 0
            quizzesCompletedTotal = userProgress.concepts.filter(c => c.attempts > 0).length;
            quizzesCompletedThisWeek = userProgress.concepts.filter(c => c.attempts > 0 && c.lastUpdated >= weekStart).length;
            // Average score: average of all scores for concepts with attempts > 0
            allScores = userProgress.concepts.filter(c => c.attempts > 0).map(c => c.score * 100); // convert to percent
            monthlyScores = userProgress.concepts.filter(c => c.attempts > 0 && c.lastUpdated >= monthStart).map(c => c.score * 100);
        }
        const avgScore = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2) : 0;
        const avgScoreMonth = monthlyScores.length > 0 ? (monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length).toFixed(2) : 0;

        // --- Study Time Calculation ---
        let totalStudyTime = 0;
        let studyTimeThisWeek = 0;
        if (user && user.studySessions) {
            totalStudyTime += user.studySessions.reduce((acc: number, session: any) => acc + session.durationMinutes, 0);
            studyTimeThisWeek += user.studySessions.filter((session: any) => session.date >= weekStart).reduce((acc: number, session: any) => acc + session.durationMinutes, 0);
        }
        // 2. Mastered concepts (estLearningTimeHours or Est_Learning_Time_Hours)
        let conceptTimes = 0;
        let conceptTimesThisWeek = 0;
        if (masteredConceptIds.length > 0) {
            const concepts = await Concept.find({ _id: { $in: masteredConceptIds } });
            conceptTimes = concepts.reduce((acc, c) => {
                // Use estLearningTimeHours or Est_Learning_Time_Hours (fallback to 0)
                const hours = c.estLearningTimeHours || c.Est_Learning_Time_Hours || 0;
                return acc + (typeof hours === 'number' ? hours * 60 : 0);
            }, 0);
        }
        if (masteredConceptIdsThisWeek.length > 0) {
            const conceptsThisWeek = await Concept.find({ _id: { $in: masteredConceptIdsThisWeek } });
            conceptTimesThisWeek = conceptsThisWeek.reduce((acc, c) => {
                const hours = c.estLearningTimeHours || c.Est_Learning_Time_Hours || 0;
                return acc + (typeof hours === 'number' ? hours * 60 : 0);
            }, 0);
        }
        totalStudyTime += conceptTimes;
        studyTimeThisWeek += conceptTimesThisWeek;
        // 3. Quiz time: 5 questions x 15 sec = 75 sec per attempt (1.25 min)
        // Use userProgress for quiz attempts
        let quizAttempts = 0;
        let quizAttemptsThisWeek = 0;
        if (userProgress) {
            quizAttempts = userProgress.concepts.reduce((acc, c) => acc + (c.attempts > 0 ? c.attempts : 0), 0);
            quizAttemptsThisWeek = userProgress.concepts.reduce((acc, c) => acc + (c.attempts > 0 && c.lastUpdated >= weekStart ? c.attempts : 0), 0);
        }
        const quizTime = quizAttempts * 1.25;
        const quizTimeThisWeek = quizAttemptsThisWeek * 1.25;
        totalStudyTime += quizTime;
        studyTimeThisWeek += quizTimeThisWeek;

        // --- Weekly Activity ---
        // Prepare array for Mon-Sun
        const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weeklyActivity = daysOfWeek.map((day, idx) => {
            // Get the date for this day in the current week
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + idx);
            // Concepts mastered that day
            const concepts = userProgress ? userProgress.concepts.filter(c => c.masteredAt && new Date(c.masteredAt).toDateString() === d.toDateString()).length : 0;
            // Study time that day (in hours)
            const time = user && user.studySessions ? user.studySessions.filter(s => new Date(s.date).toDateString() === d.toDateString()).reduce((acc, s) => acc + s.durationMinutes, 0) / 60 : 0;
            // Quizzes completed that day (attempts > 0 and lastUpdated on this day)
            const quizzes = userProgress ? userProgress.concepts.filter(c => c.attempts > 0 && new Date(c.lastUpdated).toDateString() === d.toDateString()).length : 0;
            return { day, concepts, time: Number(time.toFixed(2)), quizzes };
        });

        // --- Monthly Progress ---
        // Last 6 months including current
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const nowMonth = now.getMonth();
        const nowYear = now.getFullYear();
        const monthlyProgress = Array.from({ length: 6 }).map((_, i) => {
            // Go back i months
            const date = new Date(nowYear, nowMonth - (5 - i), 1);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            // Concepts mastered this month
            const concepts = userProgress ? userProgress.concepts.filter(c => c.masteredAt && new Date(c.masteredAt).getMonth() === date.getMonth() && new Date(c.masteredAt).getFullYear() === year).length : 0;
            // Average score for concepts updated this month
            const scores = userProgress ? userProgress.concepts.filter(c => c.lastUpdated && new Date(c.lastUpdated).getMonth() === date.getMonth() && new Date(c.lastUpdated).getFullYear() === year && c.attempts > 0).map(c => c.score * 100) : [];
            const score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            return { month, score, concepts };
        });

        // --- Quiz Performance Trends ---
        let quizPerformanceTrends: { quiz: string, score: number, date: string, difficulty: string }[] = [];
        if (userProgress && userProgress.concepts.length > 0) {
            // Get all attempts with attempts > 0, sort by lastUpdated desc
            const attemptedConcepts = userProgress.concepts.filter(c => c.attempts > 0).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
            // Get up to 5 most recent
            const recentConcepts = attemptedConcepts.slice(0, 5);
            // Fetch concept details for titles/difficulty
            const conceptIds = recentConcepts.map(c => c.conceptId);
            const conceptDocs = conceptIds.length > 0 ? await Concept.find({ _id: { $in: conceptIds } }) : [];
            quizPerformanceTrends = recentConcepts.map(c => {
                const conceptDoc = conceptDocs.find(cd => cd._id.toString() === c.conceptId.toString());
                return {
                    quiz: conceptDoc ? conceptDoc.title : 'Unknown',
                    score: Math.round((c.score || 0) * 100),
                    date: c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : '',
                    difficulty: conceptDoc && (conceptDoc.level || conceptDoc.Level) ? (conceptDoc.level || conceptDoc.Level) : 'Unknown',
                };
            });
        }

        // --- Current Course Progress ---
        let currentCourseProgress: { courseName: string, progress: number, concepts: string, nextTopic: string }[] = [];
        if (userProgress && userProgress.concepts.length > 0) {
            // Get all concept IDs
            const conceptIds = userProgress.concepts.map(c => c.conceptId);
            const conceptDocs = conceptIds.length > 0 ? await Concept.find({ _id: { $in: conceptIds } }) : [];
            // Group by category (course)
            const courseMap: Record<string, { total: number, completed: number, concepts: { title: string, mastered: boolean }[] }> = {};
            userProgress.concepts.forEach(c => {
                const doc = conceptDocs.find(cd => cd._id.toString() === c.conceptId.toString());
                const course = doc && (doc.category || doc.Category) ? (doc.category || doc.Category) : 'Uncategorized';
                if (!courseMap[course]) courseMap[course] = { total: 0, completed: 0, concepts: [] };
                courseMap[course].total += 1;
                if (c.mastered) courseMap[course].completed += 1;
                courseMap[course].concepts.push({ title: doc ? doc.title : 'Unknown', mastered: !!c.mastered });
            });
            currentCourseProgress = Object.entries(courseMap).map(([courseName, data]) => {
                const next = data.concepts.find(c => !c.mastered);
                return {
                    courseName,
                    progress: Math.round((data.completed / data.total) * 100),
                    concepts: `${data.completed}/${data.total}`,
                    nextTopic: next ? next.title : 'All mastered',
                };
            }).filter(course => course.progress > 0 && course.progress < 100);
        }

        // --- Performance Analysis (Radar Chart) ---
        // Example mapping: Problem Solving = avg score, Speed = inverse avg attempts, etc.
        let performanceAnalysis: { subject: string, value: number }[] = [];
        if (userProgress && userProgress.concepts.length > 0) {
            const scores = userProgress.concepts.filter(c => c.attempts > 0).map(c => c.score * 100);
            const attempts = userProgress.concepts.filter(c => c.attempts > 0).map(c => c.attempts);
            const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const avgAttempts = attempts.length > 0 ? attempts.reduce((a, b) => a + b, 0) / attempts.length : 0;
            // For demonstration, map to 6 skills
            performanceAnalysis = [
                { subject: 'Problem Solving', value: Math.round(avgScore) },
                { subject: 'Code Quality', value: Math.round(avgScore * 0.9) },
                { subject: 'Speed', value: Math.round(100 - Math.min(avgAttempts * 10, 100)) },
                { subject: 'Debugging', value: Math.round(avgScore * 0.85) },
                { subject: 'Testing', value: Math.round(avgScore * 0.8) },
                { subject: 'Documentation', value: Math.round(avgScore * 0.75) },
            ];
        }

        // --- Skill Proficiency (Pie/Bar Chart) ---
        let skillProficiency: { name: string, value: number, color: string }[] = [];
        if (userProgress && userProgress.concepts.length > 0) {
            const conceptIds = userProgress.concepts.map(c => c.conceptId);
            const conceptDocs = conceptIds.length > 0 ? await Concept.find({ _id: { $in: conceptIds } }) : [];
            // Group by conceptType or category
            const typeMap: Record<string, { scores: number[] }> = {};
            userProgress.concepts.forEach(c => {
                const doc = conceptDocs.find(cd => cd._id.toString() === c.conceptId.toString());
                const type = doc && (doc.conceptType || doc.category || doc.Category) ? (doc.conceptType || doc.category || doc.Category) : 'Other';
                if (!typeMap[type]) typeMap[type] = { scores: [] };
                if (c.attempts > 0) typeMap[type].scores.push((c.score || 0) * 100);
            });
            // Color palette
            const palette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6366f1", "#f472b6", "#22d3ee", "#a3e635", "#facc15"];
            let colorIdx = 0;
            skillProficiency = Object.entries(typeMap).map(([name, data]) => {
                const value = data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : 0;
                const color = palette[colorIdx % palette.length];
                colorIdx++;
                return { name, value, color };
            });
        }

        // --- Recommended Focus Areas ---
        let recommendedFocusAreas: { name: string, priority: string }[] = [];
        if (userProgress && userProgress.concepts.length > 0) {
            const notMasteredZeroScore = userProgress.concepts.filter(c => !c.mastered && (!c.score || c.score === 0));
            const conceptIds = notMasteredZeroScore.map(c => c.conceptId);
            const conceptDocs = conceptIds.length > 0 ? await Concept.find({ _id: { $in: conceptIds } }) : [];
            const priorities = ["High", "Medium", "Low"];
            recommendedFocusAreas = conceptDocs.slice(0, 3).map((c, idx) => ({ name: c.title, priority: priorities[idx] || "Low" }));
        }

        res.json({
            totalStudyTime: Math.round(totalStudyTime),
            studyTimeThisWeek: Math.round(studyTimeThisWeek),
            conceptsMasteredTotal,
            conceptsMasteredThisWeek,
            quizzesCompletedTotal,
            quizzesCompletedThisWeek,
            avgScore,
            avgScoreMonth,
            weeklyActivity,
            monthlyProgress,
            quizPerformanceTrends,
            currentCourseProgress,
            performanceAnalysis,
            skillProficiency,
            recommendedFocusAreas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Record a study session for a user
 * @route   POST /api/users/:userId/study-session
 * @access  Private
 */
export const recordStudySession = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { date, durationMinutes } = req.body;
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to record study session' });
        }
        if (!date || typeof durationMinutes !== 'number') {
            return res.status(400).json({ message: 'Missing date or durationMinutes' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.studySessions = user.studySessions || [];
        user.studySessions.push({ date: new Date(date), durationMinutes });
        await user.save();
        res.status(200).json({ message: 'Study session recorded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

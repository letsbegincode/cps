import { Router } from 'express';
import {
    getDashboard,
    updateProfile,
    getUserProgress,
    getUserAnalytics,
    recordStudySession
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All routes in this file are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/:userId/progress', getUserProgress);
router.get('/:userId/analytics', getUserAnalytics);
router.put('/profile', updateProfile);
router.post('/:userId/study-session', recordStudySession);

export default router;
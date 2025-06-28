import { Router } from 'express';
import {
    getDashboard,
    updateProfile,
    getUserProgress
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All routes in this file are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/:userId/progress', getUserProgress);
router.put('/profile', updateProfile);

export default router;
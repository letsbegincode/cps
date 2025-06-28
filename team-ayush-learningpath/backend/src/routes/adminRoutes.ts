import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createConcept,
    updateConcept,
    deleteConcept,
} from '../controllers/adminController';
import {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import { conceptValidationRules, validate } from '../validators/conceptValidator';

const router = Router();

// --- Public admin registration and login ---
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);


// --- Protected admin routes ---
router.use(protect, admin);

// User Management Routes
router.get('/users', getAllUsers);
router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// Concept (Course) Management Routes
router.post('/concepts', conceptValidationRules(), validate, createConcept);
router.route('/concepts/:id')
    .put(conceptValidationRules(), validate, updateConcept)
    .delete(deleteConcept);

// Protected admin profile (for dashboard)
router.get('/profile', getAdminProfile);

export default router;
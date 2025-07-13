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
import { protectAdmin } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import { conceptValidationRules, validate } from '../validators/conceptValidator';
import Admin from '../models/adminModel';
import EmergencyContact from '../models/emergencyContactModel';
import User from '../models/userModel';

const router = Router();

// --- Public admin registration and login ---
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// --- Emergency Contact Support Routes (PUBLIC POST) ---
router.post('/emergency-contacts', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const contact = await EmergencyContact.create({ name, email, subject, message });
        res.status(201).json(contact);
    } catch (e) {
        res.status(500).json({ message: "Failed to submit contact." });
    }
});

// --- Protected admin routes ---
router.use(protectAdmin, admin);

// User Management Routes
router.get('/users', async (req, res) => {
    try {
        // Pagination support
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const skip = (page - 1) * limit;

        // Query users, not admins
        const [totalUsers, users] = await Promise.all([
            User.countDocuments({}),
            User.find({}).select('-password').limit(limit).skip(skip).sort({ createdAt: -1 })
        ]);

        res.status(200).json({
            success: true,
            count: users.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers: totalUsers
            },
            data: users
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// Concept (Course) Management Routes
router.post('/concepts', conceptValidationRules(), validate, createConcept);
router.route('/concepts/:id')
    .put(conceptValidationRules(), validate, updateConcept)
    .delete(deleteConcept);

// Emergency contacts (admin only)
router.get('/emergency-contacts', async (req, res) => {
    try {
        const contacts = await EmergencyContact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch contacts." });
    }
});
router.patch('/emergency-contacts/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await EmergencyContact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(contact);
    } catch (e) {
        res.status(500).json({ message: "Failed to update status." });
    }
});
router.delete('/emergency-contacts/:id', async (req, res) => {
    try {
        await EmergencyContact.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete contact." });
    }
});
router.get('/emergency-contacts-count', async (req, res) => {
    try {
        const count = await EmergencyContact.countDocuments({ status: 'pending' });
        res.json({ count });
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch count." });
    }
});

// Protected admin profile (for dashboard)
router.get('/profile', getAdminProfile);
router.put('/profile', async (req, res) => {
    try {
        // Find admin by ID from req.user (set by protectAdmin middleware)
        const admin = await Admin.findById(req.user?._id);
        if (!admin) return res.status(401).json({ message: "Not authorized" });

        // Only allow updating certain fields
        const fields = ["firstName", "lastName", "phone", "avatarUrl", "todos"];
        fields.forEach(field => {
            if (req.body[field] !== undefined) admin[field] = req.body[field];
        });
        await admin.save();
        res.json(admin);
    } catch (e) {
        res.status(500).json({ message: "Failed to update profile." });
    }
});

// Update admin todos (replace all todos)
router.put('/todos', async (req, res) => {
    try {
        const admin = await Admin.findById(req.user?._id);
        if (!admin) return res.status(401).json({ message: "Not authorized" });
        admin.todos = Array.isArray(req.body.todos) ? req.body.todos : [];
        await admin.save();
        res.json({ todos: admin.todos });
    } catch (e) {
        res.status(500).json({ message: "Failed to update todos." });
    }
});

// Add a single todo
router.post('/todos', async (req, res) => {
    try {
        const admin = await Admin.findById(req.user?._id);
        if (!admin) return res.status(401).json({ message: "Not authorized" });
        if (typeof req.body.todo === "string" && req.body.todo.trim()) {
            admin.todos.push(req.body.todo.trim());
            await admin.save();
        }
        res.json({ todos: admin.todos });
    } catch (e) {
        res.status(500).json({ message: "Failed to add todo." });
    }
});

// Delete a todo by index
router.delete('/todos/:index', async (req, res) => {
    try {
        const admin = await Admin.findById(req.user?._id);
        if (!admin) return res.status(401).json({ message: "Not authorized" });
        const idx = parseInt(req.params.index, 10);
        if (!isNaN(idx) && idx >= 0 && idx < admin.todos.length) {
            admin.todos.splice(idx, 1);
            await admin.save();
        }
        res.json({ todos: admin.todos });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete todo." });
    }
});

// Logout route: clears the admin_token cookie
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // ensure path matches cookie set path
    });
    res.status(200).json({ message: "Logged out successfully" });
});

export default router;
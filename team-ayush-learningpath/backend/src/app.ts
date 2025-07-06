// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import connectDB from './config/db';
dotenv.config();
import './config/passport-setup'; 


// --- Route Imports ---
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import conceptRoutes from './routes/conceptRoutes';
import adminRoutes from './routes/adminRoutes';
import quizRoutes from './routes/quizRoutes';
import recommendationRoutes from './routes/recommendation.routes';
import learningPathRoutes from './routes/learningPathRoutes';
import courseRoutes from './routes/courseRoutes';
import logRoutes from './routes/logRoutes';

const app: Express = express();

connectDB();

// --- THIS IS THE CRUCIAL FIX ---
// Configure CORS to allow requests from your frontend's origin
// and to allow cookies to be sent back and forth.
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// --- Core Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// --- API Route Mounting ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/concepts', conceptRoutes);
app.use('/api/courses', courseRoutes);
// app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/logs', logRoutes);


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in '${process.env.NODE_ENV || 'development'}' mode on port ${PORT}`);
});

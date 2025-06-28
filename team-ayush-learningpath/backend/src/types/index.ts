import { Document, Types } from 'mongoose';

export interface ITestQuestion {
    id: number;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    tags: string[];
}

export interface IQuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}

export interface IQuizAttempt {
    score: number;
    submittedAnswers: number[];
    attemptedAt: Date;
}

export interface IConcept extends Document {
    title: string;
    Concept?: string;
    Level?: string;
    Category?: string;
    Concept_Type?: string;
    Est_Learning_Time_Hours?: number;
    Is_Fundamental?: boolean;
    Learning_Resources?: string;
    Related_Concepts?: Types.ObjectId[];
    Test_Questions?: ITestQuestion[];
    
    relatedConcepts?: string[];
    description: string;
    level?: string;
    category?: string;
    complexity?: number;
    conceptType?: string;
    estLearningTimeHours?: number;
    isFundamental?: boolean;
    learningResources?: string;
    contentBlocks: { type: string; data: string }[];
    prerequisites: Types.ObjectId[];
    quiz: IQuizQuestion[];
}

// Updated IUser interface
export interface IUser extends Document {
    firstName: string; // Changed from 'name'
    lastName: string;  // Added
    email: string;
    password?: string; // Password is now optional for OAuth users
    googleId?: string;
    githubId?: string;
    role: 'user' | 'admin';
    learningProfile: {
        concept: Types.ObjectId;
        masteryLevel: number;
        quizAttempts: IQuizAttempt[];
    }[];
    isModified: (field: string) => boolean;
}

// Updated IUser interface
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    googleId?: string;
    githubId?: string;
    role: 'user' | 'admin';
    learningProfile: {
        concept: Types.ObjectId;
        masteryLevel: number;
        quizAttempts: IQuizAttempt[];
    }[];
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    isModified: (field: string) => boolean;
    getResetPasswordToken: () => string;
}
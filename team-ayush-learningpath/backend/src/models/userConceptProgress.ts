// This file defines the UserConceptProgress model for tracking user progress on concepts.
// It includes the user's ID, an array of concept progress entries, and timestamps for creation and
// updates. Each concept progress entry tracks the concept ID, score, number of attempts, and last updated date.
// The schema is designed to allow for efficient querying and updating of user progress data.

import mongoose, { Schema, Document } from 'mongoose';

export interface IConceptProgress {
  conceptId: mongoose.Types.ObjectId;
  score: number;
  attempts: number;
  lastUpdated: Date;
}

export interface IUserConceptProgress extends Document {
  userId: mongoose.Types.ObjectId;
  concepts: IConceptProgress[];
  createdAt: Date;
  updatedAt: Date;
}

const ConceptProgressSchema = new Schema<IConceptProgress>(
  {
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no _id for subdocuments
);

const UserConceptProgressSchema = new Schema<IUserConceptProgress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    concepts: [ConceptProgressSchema],
  },
  { timestamps: true }
);

// Optional: you can also ensure unique conceptIds inside the array using application logic
// (Mongoose does not enforce uniqueness inside arrays)

const UserConceptProgress = mongoose.model<IUserConceptProgress>(
  'UserConceptProgress',
  UserConceptProgressSchema
);

export default UserConceptProgress;

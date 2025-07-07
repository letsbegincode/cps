// Test script to check backend setup and add sample data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Concept from './src/models/conceptModel';
import { IConcept } from './src/types';
import UserConceptProgress from './src/models/userConceptProgress';
import User from './src/models/userModel';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function setupTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Concept.deleteMany({});
    await UserConceptProgress.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Create test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('Created test user:', testUser._id);

    // Create concepts with proper prerequisites
    const concepts = [
      {
        title: 'Basic Programming',
        description: 'Introduction to programming fundamentals',
        complexity: 1,
        estLearningTimeHours: 2,
        prerequisites: [],
        level: 'Beginner',
        category: 'Programming'
      },
      {
        title: 'Variables and Data Types',
        description: 'Understanding variables and basic data types',
        complexity: 1,
        estLearningTimeHours: 1.5,
        prerequisites: [],
        level: 'Beginner',
        category: 'Programming'
      },
      {
        title: 'Control Structures',
        description: 'If statements, loops, and control flow',
        complexity: 2,
        estLearningTimeHours: 2.5,
        prerequisites: [],
        level: 'Beginner',
        category: 'Programming'
      },
      {
        title: 'Functions',
        description: 'Creating and using functions',
        complexity: 2,
        estLearningTimeHours: 2,
        prerequisites: [],
        level: 'Beginner',
        category: 'Programming'
      },
      {
        title: 'Arrays Introduction',
        description: 'Basic understanding of arrays',
        complexity: 2,
        estLearningTimeHours: 1.5,
        prerequisites: [],
        level: 'Beginner',
        category: 'Data Structures'
      },
      {
        title: '1D Arrays',
        description: 'One-dimensional arrays and their operations',
        complexity: 2,
        estLearningTimeHours: 2,
        prerequisites: [],
        level: 'Beginner',
        category: 'Data Structures'
      },
      {
        title: 'Array Operations',
        description: 'Common operations on arrays: insertion, deletion, searching',
        complexity: 3,
        estLearningTimeHours: 2.5,
        prerequisites: [],
        level: 'Intermediate',
        category: 'Data Structures'
      },
      {
        title: '2D Arrays',
        description: 'Two-dimensional arrays and matrix operations',
        complexity: 3,
        estLearningTimeHours: 3,
        prerequisites: [],
        level: 'Intermediate',
        category: 'Data Structures'
      },
      {
        title: 'Linked Lists',
        description: 'Singly and doubly linked lists',
        complexity: 4,
        estLearningTimeHours: 3.5,
        prerequisites: [],
        level: 'Intermediate',
        category: 'Data Structures'
      },
      {
        title: 'Stacks',
        description: 'Stack data structure and its applications',
        complexity: 3,
        estLearningTimeHours: 2.5,
        prerequisites: [],
        level: 'Intermediate',
        category: 'Data Structures'
      },
      {
        title: 'Queues',
        description: 'Queue data structure and its applications',
        complexity: 3,
        estLearningTimeHours: 2.5,
        prerequisites: [],
        level: 'Intermediate',
        category: 'Data Structures'
      }
    ];

    const createdConcepts = await Concept.insertMany(concepts);
    console.log('Created concepts:', createdConcepts.map(c => c.title));

    // Now update prerequisites to create a proper learning path
    const conceptMap = new Map(createdConcepts.map(c => [c.title, c._id]));

    // Update prerequisites to create a learning path
    await Concept.findByIdAndUpdate(conceptMap.get('Variables and Data Types'), {
      prerequisites: [conceptMap.get('Basic Programming')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Control Structures'), {
      prerequisites: [conceptMap.get('Variables and Data Types')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Functions'), {
      prerequisites: [conceptMap.get('Control Structures')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Arrays Introduction'), {
      prerequisites: [conceptMap.get('Functions')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('1D Arrays'), {
      prerequisites: [conceptMap.get('Arrays Introduction')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Array Operations'), {
      prerequisites: [conceptMap.get('1D Arrays')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('2D Arrays'), {
      prerequisites: [conceptMap.get('Array Operations')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Linked Lists'), {
      prerequisites: [conceptMap.get('2D Arrays')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Stacks'), {
      prerequisites: [conceptMap.get('Linked Lists')]
    });

    await Concept.findByIdAndUpdate(conceptMap.get('Queues'), {
      prerequisites: [conceptMap.get('Stacks')]
    });

    console.log('Updated prerequisites');

    // Create user progress for some concepts
    const userProgress = new UserConceptProgress({
      userId: testUser._id,
      concepts: [
        {
          conceptId: conceptMap.get('Basic Programming'),
          score: 0.9,
          attempts: 3,
          lastUpdated: new Date()
        },
        {
          conceptId: conceptMap.get('Variables and Data Types'),
          score: 0.8,
          attempts: 2,
          lastUpdated: new Date()
        },
        {
          conceptId: conceptMap.get('Control Structures'),
          score: 0.7,
          attempts: 4,
          lastUpdated: new Date()
        },
        {
          conceptId: conceptMap.get('Functions'),
          score: 0.6,
          attempts: 3,
          lastUpdated: new Date()
        }
      ]
    });

    await userProgress.save();
    console.log('Created user progress');

    console.log('\n✅ Test data setup complete!');
    console.log('Test user ID:', testUser._id);
    console.log('1D Arrays concept ID:', conceptMap.get('1D Arrays'));
    console.log('\nYou can now test the recommendation system with:');
    console.log(`GET /api/recommendation/${testUser._id}/${conceptMap.get('1D Arrays')}?currentConceptId=root`);

  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupTestData(); 
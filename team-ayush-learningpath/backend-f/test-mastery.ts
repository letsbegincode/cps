import mongoose from 'mongoose';
import Concept from './src/models/conceptModel';
import UserConceptProgress from './src/models/userConceptProgress';
import User from './src/models/userModel';
import { updateMasteryAndGetUnlocks, getUnlockedConcepts } from './src/utils/conceptUnlockUtils';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function testMasterySystem() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Test user not found. Please run the test setup script first.');
      return;
    }

    console.log('Test user:', testUser._id);

    // Get some concepts to test with
    const concepts = await Concept.find({}).limit(5);
    console.log('Found concepts:', concepts.map(c => ({ id: c._id, title: c.title })));

    if (concepts.length < 2) {
      console.log('Need at least 2 concepts to test. Please run the test setup script first.');
      return;
    }

    const concept1 = concepts[0];
    const concept2 = concepts[1];

    console.log('\n=== Testing Mastery System ===');

    // Test 1: Submit a quiz with score 80% (should master concept1)
    console.log('\n1. Submitting quiz for concept1 with 80% score...');
    const result1 = await updateMasteryAndGetUnlocks(
      (testUser._id as any).toString(), 
      (concept1._id as any).toString(), 
      0.8
    );
    console.log('Result:', result1);

    // Test 2: Submit a quiz with score 60% (should not master concept2)
    console.log('\n2. Submitting quiz for concept2 with 60% score...');
    const result2 = await updateMasteryAndGetUnlocks(
      (testUser._id as any).toString(), 
      (concept2._id as any).toString(), 
      0.6
    );
    console.log('Result:', result2);

    // Test 3: Get unlocked concepts
    console.log('\n3. Getting unlocked concepts...');
    const unlockedConcepts = await getUnlockedConcepts((testUser._id as any).toString());
    console.log('Unlocked concepts:', unlockedConcepts);

    // Test 4: Check user progress
    console.log('\n4. Checking user progress...');
    const userProgress = await UserConceptProgress.findOne({ userId: testUser._id });
    if (userProgress) {
      console.log('User progress:', userProgress.concepts.map(c => ({
        conceptId: c.conceptId,
        score: c.score,
        mastered: c.mastered,
        masteredAt: c.masteredAt
      })));
    } else {
      console.log('No user progress found');
    }

    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Error testing mastery system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMasterySystem();
}

export { testMasterySystem }; 
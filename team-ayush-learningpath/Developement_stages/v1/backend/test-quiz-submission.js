const mongoose = require('mongoose');
const UserConceptProgress = require('./src/models/userConceptProgress');
const User = require('./src/models/userModel');
const Concept = require('./src/models/conceptModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function testQuizSubmission() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('Test user not found. Please create a test user first.');
      return;
    }

    // Get a test concept
    const testConcept = await Concept.findOne({});
    if (!testConcept) {
      console.log('No concepts found. Please create some concepts first.');
      return;
    }

    console.log('\n=== Testing Quiz Submission ===');
    console.log('Test user ID:', testUser._id);
    console.log('Test concept ID:', testConcept._id);

    // Test 1: Check if user progress exists
    console.log('\n1. Checking existing user progress...');
    let userProgress = await UserConceptProgress.findOne({ userId: testUser._id });
    if (userProgress) {
      console.log('Existing user progress found:', userProgress.concepts.length, 'concepts');
    } else {
      console.log('No existing user progress found');
    }

    // Test 2: Simulate quiz submission (score 85%)
    console.log('\n2. Simulating quiz submission with 85% score...');
    const score = 85;
    const masteryIncrement = Math.min(score / 100, 1);

    userProgress = await UserConceptProgress.findOne({ userId: testUser._id });

    if (!userProgress) {
      // Create new progress document
      userProgress = new UserConceptProgress({
        userId: testUser._id,
        concepts: [{
          conceptId: testConcept._id,
          score: masteryIncrement,
          attempts: 1,
          lastUpdated: new Date(),
          mastered: masteryIncrement >= 0.7,
          masteredAt: masteryIncrement >= 0.7 ? new Date() : undefined,
        }],
      });
      await userProgress.save();
      console.log('✅ Created new user progress document');
    } else {
      // Update existing progress
      const conceptEntry = userProgress.concepts.find(c => c.conceptId.toString() === testConcept._id.toString());
      if (conceptEntry) {
        conceptEntry.score = Math.min((conceptEntry.score + masteryIncrement) / 2, 1);
        conceptEntry.attempts = (conceptEntry.attempts || 0) + 1;
        conceptEntry.lastUpdated = new Date();
        if (conceptEntry.score >= 0.7) {
          conceptEntry.mastered = true;
          conceptEntry.masteredAt = new Date();
        }
      } else {
        userProgress.concepts.push({
          conceptId: testConcept._id,
          score: masteryIncrement,
          attempts: 1,
          lastUpdated: new Date(),
          mastered: masteryIncrement >= 0.7,
          masteredAt: masteryIncrement >= 0.7 ? new Date() : undefined,
        });
      }
      await userProgress.save();
      console.log('✅ Updated existing user progress');
    }

    // Test 3: Verify the data was saved
    console.log('\n3. Verifying saved data...');
    const savedProgress = await UserConceptProgress.findOne({ userId: testUser._id });
    if (savedProgress) {
      console.log('✅ User progress found in database');
      console.log('Total concepts:', savedProgress.concepts.length);
      const testConceptProgress = savedProgress.concepts.find(c => c.conceptId.toString() === testConcept._id.toString());
      if (testConceptProgress) {
        console.log('Test concept progress:');
        console.log('  - Score:', testConceptProgress.score);
        console.log('  - Attempts:', testConceptProgress.attempts);
        console.log('  - Mastered:', testConceptProgress.mastered);
        console.log('  - Last Updated:', testConceptProgress.lastUpdated);
      }
    } else {
      console.log('❌ User progress not found in database');
    }

    // Test 4: Check MongoDB collection directly
    console.log('\n4. Checking MongoDB collection directly...');
    const collection = mongoose.connection.collection('userconceptprogresses');
    const documents = await collection.find({ userId: testUser._id }).toArray();
    console.log('Documents in userconceptprogresses collection:', documents.length);
    if (documents.length > 0) {
      console.log('Sample document:', JSON.stringify(documents[0], null, 2));
    }

    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Error testing quiz submission:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testQuizSubmission(); 
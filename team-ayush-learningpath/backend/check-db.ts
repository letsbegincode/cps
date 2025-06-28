// Simple script to check database contents without clearing data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Concept from './src/models/conceptModel';
import User from './src/models/userModel';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check concepts
    const conceptCount = await Concept.countDocuments();
    console.log(`\n📚 Total concepts in database: ${conceptCount}`);

    if (conceptCount > 0) {
      const sampleConcepts = await Concept.find({}).limit(10).select('title _id level category');
      console.log('\n📖 Sample concepts:');
      sampleConcepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept.title} (${concept.level || 'N/A'}) - ${concept.category || 'N/A'}`);
      });
    }

    // Check users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users in database: ${userCount}`);

    if (userCount > 0) {
      const sampleUsers = await User.find({}).limit(5).select('firstName lastName email _id');
      console.log('\n👤 Sample users:');
      sampleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabase(); 
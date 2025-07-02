const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function debugAuth() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`\nFound ${users.length} users in database:`);

    for (const user of users) {
      console.log(`\n--- User: ${user.email} ---`);
      console.log('User ID:', user._id);
      console.log('Has password:', !!user.password);
      
      if (user.password) {
        console.log('Password hash (first 30 chars):', user.password.substring(0, 30) + '...');
        
        // Test if password is double-hashed
        const isDoubleHashed = await bcrypt.compare(user.password, user.password);
        console.log('Is double-hashed:', isDoubleHashed);
        
        // Test with common passwords
        const testPasswords = ['password123', '123456', 'password', 'test123', 'admin123'];
        for (const testPass of testPasswords) {
          const isMatch = await bcrypt.compare(testPass, user.password);
          if (isMatch) {
            console.log(`✅ Matches test password: ${testPass}`);
            break;
          }
        }
      } else {
        console.log('⚠️ No password field (OAuth user?)');
      }
    }

  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the debug
debugAuth(); 
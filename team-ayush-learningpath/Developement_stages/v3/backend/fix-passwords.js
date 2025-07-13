const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function fixPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users in database`);

    for (const user of users) {
      console.log(`\nProcessing user: ${user.email}`);
      
      // Check if password is double-hashed by trying to compare with itself
      const isDoubleHashed = await bcrypt.compare(user.password, user.password);
      
      if (isDoubleHashed) {
        console.log('❌ Password is double-hashed - fixing...');
        
        // Try to extract the original password by comparing with common test passwords
        const testPasswords = ['password123', '123456', 'password', 'test123', 'admin123'];
        let originalPassword = null;
        
        for (const testPass of testPasswords) {
          const isMatch = await bcrypt.compare(testPass, user.password);
          if (isMatch) {
            originalPassword = testPass;
            break;
          }
        }
        
        if (originalPassword) {
          console.log(`Found original password: ${originalPassword}`);
          // Re-hash the original password properly
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(originalPassword, salt);
          await user.save();
          console.log('✅ Password fixed');
        } else {
          console.log('⚠️ Could not determine original password - setting to default');
          // Set a default password that the user can change
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash('password123', salt);
          await user.save();
          console.log('✅ Password set to default: password123');
        }
      } else {
        console.log('✅ Password is properly hashed');
      }
    }

    console.log('\n=== Password Fix Complete ===');
    console.log('All users have been processed.');

  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixPasswords(); 
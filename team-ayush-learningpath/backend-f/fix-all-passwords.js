const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function fixAllPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+password');
    console.log(`\nFound ${users.length} users in database`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      console.log(`\n--- Processing: ${user.email} ---`);
      
      if (!user.password) {
        console.log('⚠️ No password field - skipping (OAuth user)');
        skippedCount++;
        continue;
      }

      // Check if password is double-hashed
      const isDoubleHashed = await bcrypt.compare(user.password, user.password);
      
      if (isDoubleHashed) {
        console.log('❌ Password is double-hashed - fixing...');
        
        // Try to find the original password
        const commonPasswords = [
          'password123', '123456', 'password', 'test123', 'admin123',
          'qwerty', 'abc123', 'password1', '123456789', '12345678'
        ];
        
        let originalPassword = null;
        for (const testPass of commonPasswords) {
          const isMatch = await bcrypt.compare(testPass, user.password);
          if (isMatch) {
            originalPassword = testPass;
            break;
          }
        }
        
        if (originalPassword) {
          console.log(`✅ Found original password: ${originalPassword}`);
          // Re-hash properly
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(originalPassword, salt);
          await user.save();
          console.log('✅ Password fixed');
          fixedCount++;
        } else {
          console.log('⚠️ Could not determine original password');
          console.log('Setting to default password: password123');
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash('password123', salt);
          await user.save();
          console.log('✅ Password set to default');
          fixedCount++;
        }
      } else {
        console.log('✅ Password is properly hashed');
        skippedCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total users: ${users.length}`);
    console.log(`Fixed passwords: ${fixedCount}`);
    console.log(`Skipped (already correct): ${skippedCount}`);
    
    if (fixedCount > 0) {
      console.log('\n🎉 Password fix complete!');
      console.log('Users with fixed passwords can now login with:');
      console.log('- Their original password (if detected)');
      console.log('- Default password: password123 (if original not detected)');
    } else {
      console.log('\n✅ No passwords needed fixing');
    }

  } catch (error) {
    console.error('Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix
fixAllPasswords(); 
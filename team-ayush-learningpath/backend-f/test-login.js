const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    console.log(`\n=== Testing Login for: ${testEmail} ===`);

    // Find user
    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found');
    console.log('User ID:', user._id);
    console.log('Has password:', !!user.password);

    if (!user.password) {
      console.log('❌ User has no password');
      return;
    }

    // Test password comparison
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isPasswordValid);

    if (isPasswordValid) {
      console.log('🎉 Login would be successful!');
    } else {
      console.log('❌ Login would fail - password mismatch');
      
      // Try to identify what the password might be
      const commonPasswords = [
        'password123', '123456', 'password', 'test123', 'admin123',
        'qwerty', 'abc123', 'password1', '123456789', '12345678'
      ];
      
      console.log('\nTrying common passwords...');
      for (const pass of commonPasswords) {
        const isMatch = await bcrypt.compare(pass, user.password);
        if (isMatch) {
          console.log(`✅ Password matches: ${pass}`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the test
testLogin(); 
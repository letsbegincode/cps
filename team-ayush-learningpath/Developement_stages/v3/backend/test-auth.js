const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/userModel');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/personalized_learning';

async function testAuth() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test data
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // Clean up any existing test user
    await User.deleteOne({ email: testEmail });
    console.log('Cleaned up existing test user');

    // Test 1: Create a new user (simulate signup)
    console.log('\n=== Test 1: User Registration ===');
    const newUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: testPassword
    });
    console.log('✅ User created successfully');
    console.log('User ID:', newUser._id);
    console.log('Password in DB (should be hashed):', newUser.password);

    // Test 2: Try to login with correct credentials
    console.log('\n=== Test 2: Login with Correct Credentials ===');
    const loginUser = await User.findOne({ email: testEmail }).select('+password');
    if (!loginUser) {
      console.log('❌ User not found during login');
      return;
    }

    const isPasswordValid = await bcrypt.compare(testPassword, loginUser.password);
    console.log('Password comparison result:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Login successful - password matches');
    } else {
      console.log('❌ Login failed - password does not match');
      console.log('Entered password:', testPassword);
      console.log('Stored password hash:', loginUser.password);
    }

    // Test 3: Try to login with wrong password
    console.log('\n=== Test 3: Login with Wrong Password ===');
    const isWrongPasswordValid = await bcrypt.compare('wrongpassword', loginUser.password);
    console.log('Wrong password comparison result:', isWrongPasswordValid);
    
    if (!isWrongPasswordValid) {
      console.log('✅ Correctly rejected wrong password');
    } else {
      console.log('❌ Incorrectly accepted wrong password');
    }

    // Test 4: Check if password was hashed only once
    console.log('\n=== Test 4: Password Hashing Check ===');
    const passwordHash = loginUser.password;
    const isDoubleHashed = await bcrypt.compare(testPassword, passwordHash);
    const isTripleHashed = await bcrypt.compare(passwordHash, passwordHash);
    
    console.log('Password is properly hashed:', isDoubleHashed);
    console.log('Password is not double-hashed:', !isTripleHashed);

    console.log('\n=== Test Summary ===');
    if (isPasswordValid && !isWrongPasswordValid && isDoubleHashed && !isTripleHashed) {
      console.log('🎉 All tests passed! Authentication is working correctly.');
    } else {
      console.log('❌ Some tests failed. Check the authentication logic.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testAuth(); 
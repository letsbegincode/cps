// Test script for backend-frontend integration
// Run this with Node.js to test the backend API endpoints

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendIntegration() {
  console.log('🧪 Testing Backend Integration...\n');

  // Test 1: Check if server is running
  try {
    const response = await fetch(`${API_BASE_URL}/concepts/test`);
    const data = await response.json();
    console.log('✅ Server is running');
    console.log(`📊 Database has ${data.totalConcepts} concepts`);
    console.log('📝 Sample concepts:', data.sampleConcepts.map(c => c.title).join(', '));
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Make sure to start the backend server: cd backend && npm start');
    return;
  }

  // Test 2: Search concepts
  try {
    const response = await fetch(`${API_BASE_URL}/concepts/search?q=array`);
    const concepts = await response.json();
    console.log(`\n🔍 Search test: Found ${concepts.length} concepts containing "array"`);
    if (concepts.length > 0) {
      console.log('📝 Found concepts:', concepts.map(c => c.title).join(', '));
    }
  } catch (error) {
    console.log('❌ Search endpoint failed:', error.message);
  }

  console.log('\n🎯 Integration Test Complete!');
  console.log('📱 Now start the frontend and test the full user experience');
}

// Run the test
testBackendIntegration().catch(console.error); 
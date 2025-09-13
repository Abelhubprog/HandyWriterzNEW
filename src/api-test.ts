// Simple API test to verify endpoints are working
async function testApiEndpoints() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the test endpoint
    const testResponse = await fetch('/api/test');
    console.log('Test endpoint response:', testResponse.status, await testResponse.json());
    
    // Test the upload endpoint
    const uploadResponse = await fetch('/api/upload');
    console.log('Upload endpoint response:', uploadResponse.status);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testApiEndpoints();
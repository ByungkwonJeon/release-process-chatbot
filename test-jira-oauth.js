require('dotenv').config();
const jiraService = require('./src/services/jira');
const { logger } = require('./src/utils/logger');

async function testJiraOAuth() {
  try {
    console.log('🔐 Testing Jira OAuth2 Authentication...\n');
    
    // Test getting access token
    console.log('1. Testing access token retrieval...');
    const accessToken = await jiraService.getAccessToken();
    console.log('✅ Access token obtained successfully');
    console.log(`   Token: ${accessToken.substring(0, 20)}...`);
    
    // Test credential validation
    console.log('\n2. Testing credential validation...');
    const isValid = await jiraService.validateCredentials();
    if (isValid) {
      console.log('✅ Jira credentials are valid');
    } else {
      console.log('❌ Jira credentials validation failed');
    }
    
    // Test getting user info
    console.log('\n3. Testing user info retrieval...');
    await jiraService.updateClientAuth();
    const response = await jiraService.client.get('/rest/api/3/myself');
    console.log('✅ User info retrieved successfully');
    console.log(`   User: ${response.data.displayName} (${response.data.emailAddress})`);
    
    console.log('\n🎉 All Jira OAuth2 tests passed!');
    
  } catch (error) {
    console.error('\n❌ Jira OAuth2 test failed:', error.message);
    logger.error('Jira OAuth2 test error:', error);
    process.exit(1);
  }
}

// Run the test
testJiraOAuth();

#!/usr/bin/env node

require('dotenv').config();
const jiraOAuth2Service = require('./src/services/jiraOAuth2');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testJiraOAuth2() {
  console.log('🔍 Testing Jira OAuth2 Authentication for MCP Integration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   JIRA_HOST: ${process.env.JIRA_HOST || 'Not set'}`);
  console.log(`   JIRA_EMAIL: ${process.env.JIRA_EMAIL || 'Not set'}`);
  console.log(`   JIRA_ADFS_URL: ${process.env.JIRA_ADFS_URL || 'Not set'}`);
  console.log(`   JIRA_CLIENT_ID: ${process.env.JIRA_CLIENT_ID || 'Not set'}`);
  console.log(`   JIRA_RESOURCE: ${process.env.JIRA_RESOURCE || 'Not set'}`);
  console.log('');
  
  // Check for .sid file
  const sidPath = path.join(os.homedir(), '.sid');
  console.log('📁 .sid File Check:');
  if (fs.existsSync(sidPath)) {
    console.log('   ✅ .sid file found in home directory');
    const sidContent = fs.readFileSync(sidPath, 'utf8');
    console.log(`   📝 File size: ${sidContent.length} characters`);
  } else {
    console.log('   ❌ .sid file not found in home directory');
    console.log('   💡 Create it with: echo "your-password" > ~/.sid');
  }
  console.log('');
  
  // Test OAuth2 connection
  try {
    console.log('🧪 Testing Jira OAuth2 connection...');
    
    // Test a simple API call directly
    console.log('🧪 Testing API call (getProjects)...');
    try {
      const projectsResult = await jiraOAuth2Service.getProjects();
      console.log('✅ Jira OAuth2 authentication successful!');
      console.log(`📋 Found ${projectsResult.projects.length} projects`);
    } catch (apiError) {
      console.log('❌ Jira OAuth2 authentication failed.');
      console.log(`📋 Error: ${apiError.message}`);
    }
  } catch (error) {
    console.log('❌ Jira OAuth2 authentication error:', error.message);
    
    // Provide specific troubleshooting tips
    console.log('\n💡 Troubleshooting Tips:');
    
    if (error.message.includes('.sid')) {
      console.log('   1. Check your .sid file exists and contains your password');
      console.log('   2. Make sure the password is correct and not expired');
    }
    
    if (error.message.includes('ADFS') || error.message.includes('adfs')) {
      console.log('   3. Verify your ADFS URL is correct and accessible');
      console.log('   4. Check your network connection to the ADFS server');
    }
    
    if (error.message.includes('client_id') || error.message.includes('resource')) {
      console.log('   5. Verify your client ID and resource are correct');
      console.log('   6. Check with your Jira administrator for correct values');
    }
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('   7. Your credentials may be invalid or expired');
      console.log('   8. Try updating your password in the .sid file');
    }
    
    console.log('\n🔧 To reconfigure OAuth2, run: npm run setup:jira:oauth2');
  }
}

testJiraOAuth2().catch(console.error);

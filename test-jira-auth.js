#!/usr/bin/env node

require('dotenv').config();
const jiraService = require('./src/services/jira');

async function testJiraAuth() {
  console.log('🔍 Testing Jira Authentication...\n');
  
  // Check if environment variables are set
  console.log('📋 Environment Variables:');
  console.log(`   JIRA_HOST: ${process.env.JIRA_HOST || '❌ Not set'}`);
  console.log(`   JIRA_EMAIL: ${process.env.JIRA_EMAIL || '❌ Not set'}`);
  console.log(`   JIRA_API_TOKEN: ${process.env.JIRA_API_TOKEN ? '✅ Set' : '❌ Not set'}`);
  console.log(`   JIRA_ADFS_URL: ${process.env.JIRA_ADFS_URL || '❌ Not set'}`);
  console.log(`   JIRA_CLIENT_ID: ${process.env.JIRA_CLIENT_ID || '❌ Not set'}`);
  console.log(`   JIRA_RESOURCE: ${process.env.JIRA_RESOURCE || '❌ Not set'}`);
  console.log('');
  
  // Check for .sid file if using OAuth2
  if (process.env.JIRA_ADFS_URL) {
    const fs = require('fs');
    const path = require('path');
    const homeDir = require('os').homedir();
    const sidPath = path.join(homeDir, '.sid');
    
    if (fs.existsSync(sidPath)) {
      console.log('✅ .sid file found in home directory');
    } else {
      console.log('❌ .sid file not found in home directory');
      console.log('   Expected location:', sidPath);
    }
    console.log('');
  }
  
  try {
    console.log('🧪 Testing Jira connection...');
    const isValid = await jiraService.validateCredentials();
    
    if (isValid) {
      console.log('✅ Jira authentication successful!');
      console.log('🎉 Your Jira credentials are working properly.');
      
      // Test getting user info
      console.log('\n📊 Testing API calls...');
      try {
        const response = await jiraService.client.get('/rest/api/3/myself');
        console.log('✅ User info retrieved successfully');
        console.log(`   User: ${response.data.displayName} (${response.data.emailAddress})`);
        console.log(`   Account ID: ${response.data.accountId}`);
      } catch (error) {
        console.log('⚠️  User info test failed:', error.message);
      }
      
    } else {
      console.log('❌ Jira authentication failed');
      console.log('   Please check your credentials and try again.');
    }
    
  } catch (error) {
    console.log('❌ Jira authentication error:', error.message);
    
    if (error.message.includes('Failed to obtain Jira access token')) {
      console.log('\n💡 OAuth2 Authentication Issues:');
      console.log('   1. Check if your .sid file exists and contains your password');
      console.log('   2. Verify your ADFS URL is accessible');
      console.log('   3. Check your network connection to the ADFS server');
    } else if (error.message.includes('401')) {
      console.log('\n💡 API Token Authentication Issues:');
      console.log('   1. Verify your API token is correct');
      console.log('   2. Check if your email address is correct');
      console.log('   3. Ensure your API token has the necessary permissions');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Permission Issues:');
      console.log('   1. Check if your user has access to the Jira instance');
      console.log('   2. Verify your API token has the required scopes');
    }
  }
}

testJiraAuth().catch(console.error);

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Jira OAuth2 Configuration for MCP Integration\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupJiraOAuth2() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExists = fs.existsSync(envPath);
    
    if (!envExists) {
      console.log('📝 Creating .env file from template...');
      const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
      fs.writeFileSync(envPath, envExample);
    }
    
    console.log('🔐 Please provide your Jira OAuth2 configuration:\n');
    
    const jiraHost = await question('Jira Host (e.g., https://your-domain.atlassian.net): ');
    const jiraEmail = await question('Jira Email: ');
    const adfsUrl = await question('ADFS URL (default: https://idaq2.jpmorganchase.com/adfs/oauth2/token): ') || 'https://idaq2.jpmorganchase.com/adfs/oauth2/token';
    const clientId = await question('Client ID (default: PC-111661-SID-277611-PROD): ') || 'PC-111661-SID-277611-PROD';
    const resource = await question('Resource (default: JPMC:URI:RS-25188-87400-Jira0authAPI-PROD): ') || 'JPMC:URI:RS-25188-87400-Jira0authAPI-PROD';
    
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Jira OAuth2 configuration
    envContent = envContent.replace(/JIRA_HOST=.*/g, `JIRA_HOST=${jiraHost}`);
    envContent = envContent.replace(/JIRA_EMAIL=.*/g, `JIRA_EMAIL=${jiraEmail}`);
    envContent = envContent.replace(/JIRA_ADFS_URL=.*/g, `JIRA_ADFS_URL=${adfsUrl}`);
    envContent = envContent.replace(/JIRA_CLIENT_ID=.*/g, `JIRA_CLIENT_ID=${clientId}`);
    envContent = envContent.replace(/JIRA_RESOURCE=.*/g, `JIRA_RESOURCE=${resource}`);
    
    // Remove API token if it exists (we're using OAuth2)
    envContent = envContent.replace(/JIRA_API_TOKEN=.*\n/g, '');
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Jira OAuth2 configuration saved to .env file');
    
    // Check for .sid file
    const homeDir = require('os').homedir();
    const sidPath = path.join(homeDir, '.sid');
    
    if (!fs.existsSync(sidPath)) {
      console.log('\n⚠️  .sid file not found in home directory');
      console.log('📝 Creating .sid file...');
      
      const password = await question('Enter your password for .sid file: ');
      fs.writeFileSync(sidPath, password);
      
      console.log('✅ .sid file created successfully');
    } else {
      console.log('\n✅ .sid file found in home directory');
    }
    
    // Test the OAuth2 connection
    console.log('\n🧪 Testing Jira OAuth2 connection...');
    
    // Load environment variables
    require('dotenv').config();
    
    const jiraOAuth2Service = require('./src/services/jiraOAuth2');
    
    try {
      // Test by getting projects
      const projectsResult = await jiraOAuth2Service.getProjects();
      console.log('✅ Jira OAuth2 connection successful!');
      console.log(`📋 Found ${projectsResult.projects.length} projects`);
    } catch (error) {
      console.log('❌ Jira OAuth2 connection failed:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure your .sid file contains the correct password');
      console.log('   2. Verify your Jira host URL is correct');
      console.log('   3. Check that your ADFS URL is accessible');
      console.log('   4. Ensure your client ID and resource are correct');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupJiraOAuth2();

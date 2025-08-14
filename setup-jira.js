#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Jira Integration Setup\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupJira() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExists = fs.existsSync(envPath);
    
    if (!envExists) {
      console.log('📝 Creating .env file from template...');
      const envExample = fs.readFileSync(path.join(__dirname, 'env.example'), 'utf8');
      fs.writeFileSync(envPath, envExample);
    }
    
    console.log('🔐 Please provide your Jira configuration:\n');
    
    const jiraHost = await question('Jira Host (e.g., https://your-domain.atlassian.net): ');
    const jiraEmail = await question('Jira Email: ');
    const jiraApiToken = await question('Jira API Token (leave empty if using OAuth2): ');
    
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Jira configuration
    envContent = envContent.replace(/JIRA_HOST=.*/g, `JIRA_HOST=${jiraHost}`);
    envContent = envContent.replace(/JIRA_EMAIL=.*/g, `JIRA_EMAIL=${jiraEmail}`);
    
    if (jiraApiToken) {
      envContent = envContent.replace(/JIRA_API_TOKEN=.*/g, `JIRA_API_TOKEN=${jiraApiToken}`);
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Jira configuration saved to .env file');
    
    // Test the connection
    console.log('\n🧪 Testing Jira connection...');
    
    // Load environment variables
    require('dotenv').config();
    
    const jiraService = require('./src/services/jira');
    
    try {
      const isValid = await jiraService.validateCredentials();
      if (isValid) {
        console.log('✅ Jira connection successful!');
      } else {
        console.log('❌ Jira connection failed. Please check your credentials.');
      }
    } catch (error) {
      console.log('❌ Jira connection failed:', error.message);
      console.log('\n💡 If you\'re using JPMorgan Chase ADFS:');
      console.log('   1. Make sure you have a .sid file in your home directory');
      console.log('   2. The .sid file should contain your password');
      console.log('   3. Run: echo "your-password" > ~/.sid');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupJira();

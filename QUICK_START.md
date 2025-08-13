# 🚀 Quick Start Guide

## **How to Use the Chatbot**

### **1. Setup (One-time)**

```bash
# Install dependencies
npm install
npm run install-client

# Copy environment template
cp env.example .env

# Edit .env with your credentials (see below)
```

### **2. Configure Environment Variables**

Edit `.env` file with your actual credentials:

```env
# Jira Configuration
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Bitbucket Configuration
BITBUCKET_HOST=https://api.bitbucket.org
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password
BITBUCKET_WORKSPACE=your-workspace
BITBUCKET_REPOSITORY=your-repository

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Spinnaker Configuration
SPINNAKER_HOST=https://your-spinnaker-host
SPINNAKER_USERNAME=your-username
SPINNAKER_PASSWORD=your-password

# Terraform Configuration
JULES_HOST=your-jules-server
JULES_USERNAME=your-username
JULES_PRIVATE_KEY_PATH=/path/to/private/key

# MCP Configuration
MCP_SERVER_URL=ws://localhost:3002
MCP_PORT=3002
```

### **3. Start the Services**

**Terminal 1 - MCP Server:**
```bash
npm run mcp:start
```

**Terminal 2 - Main Application:**
```bash
npm run dev
```

### **4. Access the Chatbot**

- **Web Interface**: http://localhost:3000
- **API**: http://localhost:3001/api/chat
- **WebSocket**: ws://localhost:3001

## **🎯 Quick Commands to Try**

### **Basic Release Management**
```
"Start a new release for version 2.1.0"
"What's the status?"
"Show me the logs"
"Deploy backend services to staging"
```

### **Enhanced Jira Features**
```
"Find release candidates for project PROJ"
"Create release version 2.1.0 for project PROJ"
"Get development info for PROJ-123"
"Search for high priority bugs in project PROJ"
"Create a story for user authentication feature"
```

### **Step-by-step Execution**
```
"Execute step 3"
"Run infrastructure build"
"Execute release notes generation"
```

## **📊 Example Workflow**

1. **Start Release**: `"Start a new release for version 2.1.0"`
2. **Check Status**: `"What's the status?"`
3. **Find Candidates**: `"Find release candidates for project PROJ"`
4. **Create Version**: `"Create release version 2.1.0 for project PROJ"`
5. **Deploy**: `"Deploy backend services to staging"`
6. **Verify**: `"What's the status?"`

## **🔧 Troubleshooting**

### **Common Issues**

**"MCP server not connected"**
```bash
# Check if MCP server is running
npm run mcp:start
```

**"Credentials validation failed"**
```bash
# Check your .env file
cat .env
```

**"Database error"**
```bash
# Remove old database and reinitialize
rm -f release_chatbot.db
npm run db:init
```

### **Debug Mode**
```env
LOG_LEVEL=debug
```

## **📚 Documentation**

- `CHATBOT_USAGE_GUIDE.md` - Complete usage guide
- `HYBRID_APPROACH.md` - Hybrid Jira integration details
- `MCP_INTEGRATION.md` - Model Context Protocol details

## **🎉 You're Ready!**

The chatbot is now ready to help you manage your entire release process with natural language commands!

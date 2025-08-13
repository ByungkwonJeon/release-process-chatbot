# Chatbot Usage Guide

## 🚀 Quick Start

### 1. **Setup and Installation**

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd chatbot_for_release_process

# Install dependencies
npm install
npm run install-client

# Set up environment variables
cp env.example .env
# Edit .env with your actual credentials

# Initialize the database
npm run db:init

# Start the MCP server (in one terminal)
npm run mcp:start

# Start the main application (in another terminal)
npm run dev
```

### 2. **Access the Chatbot**

- **Web Interface**: Open `http://localhost:3000` in your browser
- **API Endpoints**: Use `http://localhost:3001/api/chat` for programmatic access
- **WebSocket**: Connect to `ws://localhost:3001` for real-time communication

## 💬 Natural Language Commands

### **Release Management Commands**

#### **Start a Release**
```
"Start a new release for version 2.1.0"
"Start release version 3.0.0 to production"
"Begin release 1.5.2 for staging"
```

**Response Example:**
```
🚀 I've started a new release for version 2.1.0! Here's what I'll do:

1. 🌿 Create release branch: release/v2.1.0
2. 📝 Generate release notes from Jira
3. 🏗️ Build infrastructure with Terraform
4. 🔨 Build services (Spring Boot, React, Lambda)
5. 🚀 Deploy to staging via Spinnaker
6. ✅ Verify deployment and health checks

Release ID: abc123-def456
You can check the status anytime by asking "What's the status?"
```

#### **Check Release Status**
```
"What's the status?"
"What's the status of the current release?"
"Show me the release status"
```

**Response Example:**
```
📊 **Release Status: 2.1.0**

Environment: staging
Overall Status: in_progress

**Step Progress:**
✅ Create Release Branch: completed
✅ Generate Release Notes: completed
🔄 Build Infrastructure: in_progress
⏳ Build Services: pending
⏳ Deploy Services: pending
⏳ Verify Deployment: pending
```

#### **View Logs**
```
"Show me the logs"
"Show me the logs for the infrastructure build"
"Show logs for step 3"
```

**Response Example:**
```
📋 **Logs for Infrastructure Build**

[2024-01-15 10:30:15] INFO: Starting Terraform initialization...
[2024-01-15 10:30:18] INFO: Terraform initialized successfully
[2024-01-15 10:30:20] INFO: Planning infrastructure changes...
[2024-01-15 10:30:45] INFO: Plan completed - 5 resources to create
[2024-01-15 10:31:00] INFO: Applying infrastructure changes...
[2024-01-15 10:35:30] INFO: Infrastructure deployed successfully
```

#### **Deploy Specific Services**
```
"Deploy backend services to staging"
"Deploy the frontend app to production"
"Deploy lambda functions to staging"
```

**Response Example:**
```
🚀 **Deploying Backend Services to Staging**

✅ Triggered deployment for backend-api
✅ Triggered deployment for notification-service
✅ Triggered deployment for auth-service

All services are being deployed via Spinnaker. 
You can check the status by asking "What's the status?"
```

### **Enhanced Jira Commands**

#### **Find Release Candidates**
```
"Find release candidates for project PROJ"
"Show me release candidates in project ABC"
"Get release candidates for project XYZ"
```

**Response Example:**
```
📋 **Release Candidates for Project PROJ**

Found 15 issues ready for release:

**Backend** (8 issues):
• PROJ-123: Implement user authentication
• PROJ-124: Add API rate limiting
• PROJ-125: Fix database connection pooling
• PROJ-126: Optimize query performance
• PROJ-127: Add logging middleware

**Frontend** (5 issues):
• PROJ-128: Update user interface design
• PROJ-129: Add responsive navigation
• PROJ-130: Implement dark mode toggle

**Infrastructure** (2 issues):
• PROJ-131: Update Terraform configuration
• PROJ-132: Add monitoring alerts
```

#### **Create Release Versions**
```
"Create release version 2.1.0 for project PROJ"
"Create version 3.0.0 in project ABC"
"Make release version 1.5.2 for project XYZ"
```

**Response Example:**
```
✅ **Release Version Created**

**Version:** 2.1.0
**Project:** PROJ
**Description:** Release 2.1.0 created via chatbot
**ID:** 12345
```

#### **Get Development Information**
```
"Get development info for PROJ-123"
"Show dev info for ABC-456"
"Get commits and PRs for XYZ-789"
```

**Response Example:**
```
🔧 **Development Info for PROJ-123**

**Pull Requests:** 2
• Add user authentication feature
• Update API documentation
• Fix authentication bug

**Commits:** 5
• feat: implement user authentication
• docs: update API documentation
• fix: resolve authentication issues
• test: add authentication tests
• refactor: clean up authentication code

**Branches:** 1
• feature/user-authentication
```

#### **Search Issues**
```
"Search for high priority bugs in project PROJ"
"Find stories in project ABC"
"Search for done issues in project XYZ"
"Look for authentication issues in project PROJ"
```

**Response Example:**
```
🔍 **Search Results for "high priority bugs" in PROJ**

Found 3 issues:

✅ **PROJ-123**: Critical authentication bug
   Status: Done | Priority: High | Type: Bug

🔄 **PROJ-124**: Database connection timeout
   Status: In Progress | Priority: High | Type: Bug

📋 **PROJ-125**: API rate limiting issue
   Status: To Do | Priority: High | Type: Bug
```

#### **Create Issues**
```
"Create a story for user authentication feature"
"Create a bug for login page not working"
"Create a task for updating documentation"
```

**Response Example:**
```
✅ **New STORY Created**

**Issue Key:** PROJ-126
**Summary:** user authentication feature
**Project:** PROJ
**Type:** Story
```

### **Execute Specific Steps**
```
"Execute step 3"
"Run infrastructure build"
"Execute release notes generation"
"Run deployment verification"
```

**Response Example:**
```
🔄 **Executing Step 3: Build Infrastructure**

Starting Terraform build for staging environment...
✅ Terraform initialized
✅ Workspace selected: staging
✅ Configuration validated
✅ Plan created
✅ Infrastructure applied

Infrastructure build completed successfully!
```

## 🔧 Advanced Usage

### **API Usage**

#### **Send a Message**
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Start a new release for version 2.1.0",
    "sessionId": "user123"
  }'
```

#### **Get Conversation History**
```bash
curl http://localhost:3001/api/chat/conversation/user123
```

#### **Check Release Status**
```bash
curl http://localhost:3001/api/releases/status/abc123-def456
```

### **WebSocket Usage**

```javascript
const socket = io('http://localhost:3001');

// Send a message
socket.emit('chat_message', {
  message: 'Start a new release for version 2.1.0',
  sessionId: 'user123'
});

// Listen for responses
socket.on('chat_response', (data) => {
  console.log('Bot response:', data.response);
});

// Listen for release updates
socket.on('release_update', (data) => {
  console.log('Release status:', data.status);
});
```

## 📊 Monitoring and Logs

### **Real-time Monitoring**

The chatbot provides real-time updates for:
- ✅ Release progress
- 🔄 Step execution status
- 📋 Log streaming
- 🚨 Error notifications

### **Log Access**

```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# View MCP server logs
tail -f logs/mcp.log
```

## 🎯 Best Practices

### **1. Clear Commands**
- ✅ "Start a new release for version 2.1.0"
- ❌ "do release thing"

### **2. Specific Project References**
- ✅ "Find release candidates for project PROJ"
- ❌ "Find release candidates"

### **3. Environment Specification**
- ✅ "Deploy to staging"
- ✅ "Deploy to production"
- ❌ "Deploy" (defaults to staging)

### **4. Step-by-step Execution**
- ✅ "Execute step 3"
- ✅ "Run infrastructure build"
- ❌ "do step thing"

## 🚨 Troubleshooting

### **Common Issues**

#### **"MCP server not connected"**
```bash
# Check if MCP server is running
npm run mcp:start

# Check MCP server logs
tail -f logs/mcp.log
```

#### **"Credentials validation failed"**
```bash
# Check your .env file
cat .env

# Validate credentials
curl http://localhost:3001/api/health
```

#### **"Release not found"**
```bash
# Check database
sqlite3 release_chatbot.db "SELECT * FROM Releases ORDER BY createdAt DESC LIMIT 5;"

# Restart the application
npm run dev
```

### **Debug Mode**

Enable debug logging by setting in your `.env`:
```env
LOG_LEVEL=debug
```

## 🎉 Example Workflows

### **Complete Release Workflow**

1. **Start Release**
   ```
   User: "Start a new release for version 2.1.0"
   Bot: [Creates release and starts workflow]
   ```

2. **Check Status**
   ```
   User: "What's the status?"
   Bot: [Shows current progress]
   ```

3. **View Logs**
   ```
   User: "Show me the logs for infrastructure build"
   Bot: [Shows detailed logs]
   ```

4. **Deploy Services**
   ```
   User: "Deploy backend services to staging"
   Bot: [Triggers deployments]
   ```

5. **Verify Deployment**
   ```
   User: "What's the status?"
   Bot: [Shows final status]
   ```

### **Jira Integration Workflow**

1. **Find Release Candidates**
   ```
   User: "Find release candidates for project PROJ"
   Bot: [Shows issues ready for release]
   ```

2. **Create Release Version**
   ```
   User: "Create release version 2.1.0 for project PROJ"
   Bot: [Creates Jira version]
   ```

3. **Get Development Info**
   ```
   User: "Get development info for PROJ-123"
   Bot: [Shows commits, PRs, branches]
   ```

4. **Search Issues**
   ```
   User: "Search for high priority bugs in project PROJ"
   Bot: [Shows matching issues]
   ```

## 🎯 Next Steps

1. **Configure your environment** with actual credentials
2. **Test basic commands** to ensure everything works
3. **Try advanced Jira features** for enhanced workflow
4. **Monitor logs** to understand the system behavior
5. **Customize workflows** for your specific needs

The chatbot is now ready to help you manage your entire release process with natural language commands!

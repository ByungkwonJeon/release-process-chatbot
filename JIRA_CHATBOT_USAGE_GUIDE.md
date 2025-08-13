# Jira Chatbot Usage Guide

This guide explains how to use the Jira integration features in the release process chatbot.

## 🚀 Quick Start

### 1. Prerequisites
- Ensure you have access to your Jira instance
- Set up OAuth2 authentication (if using JPMorgan Chase ADFS)
- Configure your environment variables

### 2. Start the Chatbot
```bash
# Start the main application
npm start

# Or start in development mode
npm run dev
```

### 3. Access the Chatbot
- Open your browser and go to: `http://localhost:3000`
- You'll see the chatbot interface where you can interact with Jira

## 📋 Jira Commands Reference

### **Release Notes Generation**

#### Generate Release Notes from Sprint
```
Generate release notes for version 2.1.0 from sprint 123
```

**What it does:**
- Fetches all stories from the specified sprint
- Categorizes stories by type (Features, Bugs, Improvements)
- Generates formatted release notes with summaries
- Includes sprint information and release date

#### Generate Release Notes with Custom Format
```
Generate release notes for version 2.1.0 from sprint 123 with detailed descriptions
```

### **Sprint Management**

#### Get Sprint Information
```
Get info for sprint 123
```

**Response includes:**
- Sprint name and ID
- Start and end dates
- Sprint status
- Board information

#### Get Active Sprints
```
Get active sprints for board 456
```

#### Get Stories from Sprint
```
Get stories from sprint 123
```

**Response includes:**
- Story keys and summaries
- Status and priority
- Assignee information
- Story type and components

### **Story Creation and Management**

#### Create a New Story
```
Create jira story in project PROJ with title User authentication system
```

**Required parameters:**
- `project`: The Jira project key
- `title`: The story title

#### Create Story with Detailed Information
```
Create jira story in project PROJ with title Payment integration type story priority high assignee john.doe@company.com
```

**Optional parameters:**
- `type`: Story type (Story, Bug, Task, etc.)
- `priority`: Priority level (High, Medium, Low)
- `assignee`: Assignee email address
- `description`: Story description
- `labels`: Comma-separated labels

#### Create Epic
```
Create jira epic in project PROJ with title Customer Portal Redesign
```

#### Create Bug Report
```
Create jira bug in project PROJ with title Login page not loading priority critical
```

### **AI-Powered Content Generation**

#### Generate Story Content with AI
```
Generate story content for title Payment integration in project PROJ with type story epic Payment System priority high
```

**What it does:**
- Uses AI to generate comprehensive story content
- Includes detailed description, acceptance criteria
- Suggests appropriate labels and components
- Creates realistic story points and estimates

#### Generate Epic Content
```
Generate epic content for title Customer Portal Redesign in project PROJ with description Modernize customer portal interface
```

### **Story Information and Updates**

#### Get Story Details
```
Get details for story PROJ-123
```

#### Update Story Status
```
Update story PROJ-123 status to In Progress
```

#### Add Comment to Story
```
Add comment to story PROJ-123: "Development completed, ready for testing"
```

### **Project and Board Management**

#### List Projects
```
List jira projects
```

#### Get Project Information
```
Get info for project PROJ
```

#### List Boards
```
List jira boards
```

#### Get Board Information
```
Get info for board 456
```

## 🎯 Advanced Usage Examples

### **Release Process Integration**

#### Complete Release Workflow
```
1. "Get active sprints for board 456"
2. "Generate release notes for version 2.1.0 from sprint 123"
3. "Create jira story in project PROJ with title Deploy version 2.1.0 to production"
4. "Update story PROJ-456 status to In Progress"
```

### **Sprint Planning**

#### Sprint Review and Planning
```
1. "Get stories from sprint 123"
2. "Generate release notes for version 2.0.0 from sprint 123"
3. "Create jira epic in project PROJ with title Sprint 124 Planning"
4. "Generate story content for title User authentication in project PROJ with type story epic Sprint 124 Planning priority high"
```

### **Bug Management**

#### Bug Tracking Workflow
```
1. "Create jira bug in project PROJ with title Login page crashes priority critical"
2. "Get details for story PROJ-789"
3. "Update story PROJ-789 status to In Progress"
4. "Add comment to story PROJ-789: 'Root cause identified, fix in progress'"
```

## 🔧 Configuration Options

### **Environment Variables**

```env
# Jira Host
JIRA_HOST=https://your-domain.atlassian.net

# OAuth2 Configuration (for JPMorgan Chase)
JIRA_ADFS_URL=https://idaq2.jpmorganchase.com/adfs/oauth2/token
JIRA_CLIENT_ID=PC-111661-SID-277611-PROD
JIRA_RESOURCE=JPMC:URI:RS-25188-87400-Jira0authAPI-PROD

# API Token (alternative authentication)
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

### **Custom Fields Support**

The chatbot supports custom Jira fields. You can reference them in your commands:

```
Create jira story in project PROJ with title New feature customfield_10001 "High Priority" customfield_10002 "Frontend"
```

## 📊 Response Formats

### **Release Notes Format**
```markdown
# Release Notes - Version 2.1.0

**Release Date:** 2024-01-15
**Sprint:** 123

## 🚀 New Features
- **PROJ-123:** User authentication system
- **PROJ-124:** Payment integration

## 🔧 Improvements
- **PROJ-125:** Performance optimization

## 🐛 Bug Fixes
- **PROJ-126:** Fixed login page crash

## 📊 Summary
- Total Stories: 4
- Features: 2
- Improvements: 1
- Bug Fixes: 1
```

### **Story Information Format**
```json
{
  "key": "PROJ-123",
  "summary": "User authentication system",
  "status": "In Progress",
  "priority": "High",
  "type": "Story",
  "assignee": "John Doe",
  "components": ["Frontend", "Backend"],
  "labels": ["authentication", "security"]
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### Authentication Errors
```
Error: Failed to obtain Jira access token
```
**Solution:**
- Check your `.sid` file exists and contains correct password
- Ensure you're connected to JPMorgan Chase network
- Verify OAuth2 configuration in `.env` file

#### Permission Errors
```
Error: Jira credentials validation failed
```
**Solution:**
- Verify your Jira host URL is correct
- Check you have access to the Jira instance
- Ensure your account has necessary permissions

#### Project Not Found
```
Error: Project PROJ not found
```
**Solution:**
- Verify the project key is correct
- Check you have access to the project
- Use `List jira projects` to see available projects

### **Debug Mode**

Enable debug logging to troubleshoot issues:

```env
LOG_LEVEL=debug
```

### **Testing Commands**

Test your Jira integration:

```bash
# Test OAuth2 authentication
npm run test:jira

# Test specific functionality
node -e "
const jira = require('./src/services/jira');
jira.getSprintStories(123).then(stories => {
  console.log('Stories:', stories.length);
}).catch(console.error);
"
```

## 📱 Chatbot Interface Tips

### **Natural Language Processing**
The chatbot understands natural language commands. You can be conversational:

```
"Hey, can you create a new story for the login feature?"
"Show me what's in sprint 123"
"What's the status of PROJ-456?"
```

### **Context Awareness**
The chatbot remembers context within a session:

```
User: "Get stories from sprint 123"
Bot: [Shows stories]

User: "Create a story in the same project"
Bot: [Uses project from previous context]
```

### **Multi-step Commands**
You can combine multiple actions:

```
"Create a story for the payment feature and then generate release notes for sprint 123"
```

## 🔄 Integration with Other Tools

### **Release Process Integration**
```
1. "Generate release notes for version 2.1.0 from sprint 123"
2. "Create release branch for version 2.1.0"
3. "Deploy to dev environment"
4. "Create jira story for production deployment"
```

### **Terraform Integration**
```
1. "Create jira story for infrastructure changes"
2. "Apply terraform changes"
3. "Update story status to completed"
```

## 📞 Support

For issues with:
- **Jira Integration**: Check this guide and `JIRA_OAUTH2_SETUP.md`
- **Authentication**: Verify your OAuth2 setup
- **Permissions**: Contact your Jira administrator
- **Chatbot Issues**: Check application logs and error messages

## 🎯 Best Practices

1. **Use Descriptive Titles**: Make story titles clear and specific
2. **Include Context**: Provide relevant information in commands
3. **Regular Updates**: Keep story statuses current
4. **Use Labels**: Add appropriate labels for better organization
5. **Review Generated Content**: Always review AI-generated content before using
6. **Test Commands**: Use test commands to verify functionality

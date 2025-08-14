# 🎯 Jira Integration Instructions

## 📋 Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Release Notes Generation](#release-notes-generation)
3. [Jira Story Creation](#jira-story-creation)
4. [AI-Powered Content Generation](#ai-powered-content-generation)
5. [Advanced Jira Features](#advanced-jira-features)
6. [Custom Fields Support](#custom-fields-support)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Setup & Configuration

### **Environment Variables**
Add these to your `.env` file:

```env
# Jira Configuration
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

### **Getting Your Jira API Token**
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "Release Chatbot")
4. Copy the generated token
5. Add it to your `.env` file

### **Required Permissions**
Your Jira account needs:
- **Read access** to projects for release notes
- **Create access** to projects for story creation
- **Edit access** to issues for updates
- **Admin access** to custom fields

---

## 📝 Release Notes Generation

### **Basic Release Notes**
```bash
"Generate release notes for version 2.1.0 from sprint 123"
```

### **Enhanced Release Notes with Custom Fields**
The chatbot automatically includes:
- **Summary** - Issue summary
- **Epic** (customfield_31603) - Epic information
- **Key** - Issue key (e.g., PROJ-123)
- **Status** - Current issue status
- **Sprint** (customfield_10004) - Sprint information
- **Approver** (customfield_10545) - Approver details
- **Reporter Team** (customfield_10300) - Team information

### **Release Notes Commands**
```bash
# Generate from specific sprint
"Generate release notes for version 2.1.0 from sprint 123"

# Generate from project
"Generate release notes for version 2.1.0 from project PROJ"

# Generate with specific JQL
"Generate release notes for version 2.1.0 with JQL 'project = PROJ AND sprint = 123'"
```

### **Release Notes Output Format**
```
# Release Notes for Version 2.1.0

## Summary
- Total Issues: 15
- Features: 8
- Improvements: 4
- Bug Fixes: 3

## Features
- **PROJ-123:** User authentication system
  - **Status:** Done
  - **Epic:** User Management
  - **Sprint:** Sprint 123
  - **Approver:** John Doe
  - **Reporter Team:** Backend Team

## Statistics
- Epics: 3 (User Management, Payment System, UI Improvements)
- Approvers: 2 (John Doe, Jane Smith)
- Reporter Teams: 3 (Backend Team, Frontend Team, QA Team)
```

---

## 📖 Jira Story Creation

### **Basic Story Creation**
```bash
"Create jira story in project PROJ with title User authentication system"
```

### **Detailed Story Creation**
```bash
"Create detailed story in project PROJ with title Payment integration description Secure payment gateway implementation assignee john.doe priority high epic Payment System sprint Sprint 123 labels payment,integration components backend fixversion 2.1.0"
```

### **Story Creation Parameters**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `project` | Project key | `PROJ` |
| `title` | Story summary | `User authentication system` |
| `description` | Detailed description | `Implement secure user authentication` |
| `assignee` | Username | `john.doe` |
| `priority` | Priority level | `high`, `medium`, `low` |
| `epic` | Epic name | `User Management` |
| `sprint` | Sprint name | `Sprint 123` |
| `labels` | Comma-separated labels | `authentication,security` |
| `components` | Comma-separated components | `backend,frontend` |
| `fixversion` | Fix version | `2.1.0` |

### **Story Creation Examples**

#### **Simple Feature Story**
```bash
"Create jira story in project PROJ with title Add user profile page"
```

#### **Detailed Bug Report**
```bash
"Create detailed story in project PROJ with title Fix login button not working description Users cannot click the login button on mobile devices assignee jane.smith priority high epic User Management labels bug,mobile,ui"
```

#### **Technical Task**
```bash
"Create detailed story in project PROJ with title Update database schema description Add new columns for user preferences assignee dev.team priority medium components database labels technical,refactor"
```

---

## 🤖 AI-Powered Content Generation

### **Generate Story Content with Copilot**
```bash
"Generate story content for title User authentication system in project PROJ with type story epic User Management priority high"
```

### **VS Code Integration Steps**

1. **Install GitHub Copilot Extension**
   ```bash
   # In VS Code Extensions marketplace
   # Search for "GitHub Copilot" and install
   ```

2. **Authenticate Copilot**
   - Sign in to GitHub in VS Code
   - Authorize GitHub Copilot

3. **Use Generated Content**
   - Open the Jira story in VS Code
   - Use `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
   - Use the suggested prompts from the chatbot
   - Press `Tab` to accept Copilot suggestions

### **Generated Content Includes**
- **Structured Description** with context and requirements
- **Acceptance Criteria** with specific test cases
- **Copilot Suggestions** with VS Code commands
- **Prompt Templates** for further refinement

### **Content Generation Examples**

#### **Feature Story**
```bash
"Generate story content for title Payment integration in project PROJ with type story epic Payment System priority high"
```

#### **Bug Report**
```bash
"Generate story content for title Fix API timeout in project PROJ with type bug epic Backend priority critical"
```

#### **Technical Task**
```bash
"Generate story content for title Database optimization in project PROJ with type task epic Performance priority medium"
```

---

## 🔍 Advanced Jira Features

### **Search Issues**
```bash
"Search for high priority bugs in project PROJ"
"Search for issues assigned to john.doe"
"Search for issues in epic User Management"
```

### **Get Issue Details**
```bash
"Get details for issue PROJ-123"
"Get development info for PROJ-123"
```

### **Find Release Candidates**
```bash
"Find release candidates for project PROJ"
"Find release candidates for project PROJ in sprint 123"
```

### **Create Release Versions**
```bash
"Create release version 2.1.0 for project PROJ"
"Create release version 2.1.0 for project PROJ with description Major feature release"
```

### **Transition Issues**
```bash
"Move issue PROJ-123 to Done"
"Move issue PROJ-123 to In Progress with comment Started implementation"
```

---

## 🏷️ Custom Fields Support

### **Supported Custom Fields**
The chatbot supports these custom fields:

| Field | ID | Description |
|-------|----|-------------|
| Epic | customfield_31603 | Epic information |
| Sprint | customfield_10004 | Sprint details |
| Approver | customfield_10545 | Approver information |
| Reporter Team | customfield_10300 | Team assignment |

### **Using Custom Fields**
Custom fields are automatically included in:
- Release notes generation
- Issue details retrieval
- Story creation (when specified)

### **Custom Field Examples**
```bash
# Create story with epic
"Create detailed story in project PROJ with title New feature epic User Management"

# Create story with sprint
"Create detailed story in project PROJ with title Bug fix sprint Sprint 123"

# Create story with approver
"Create detailed story in project PROJ with title Code review approver john.doe"
```

---

## 🚀 Complete Workflow Examples

### **End-to-End Release Process**
```bash
# 1. Generate release notes
"Generate release notes for version 2.1.0 from sprint 123"

# 2. Create release version
"Create release version 2.1.0 for project PROJ"

# 3. Create follow-up stories
"Create detailed story in project PROJ with title Post-release monitoring description Monitor system performance after release assignee ops.team priority medium epic Operations"

# 4. Generate content for new stories
"Generate story content for title Performance optimization in project PROJ with type story epic Performance priority high"
```

### **Sprint Planning Workflow**
```bash
# 1. Find incomplete stories
"Search for issues in sprint 123 with status not Done"

# 2. Create new stories for next sprint
"Create detailed story in project PROJ with title User feedback system description Implement user feedback collection assignee frontend.team priority high epic User Experience sprint Sprint 124"

# 3. Generate content for complex stories
"Generate story content for title API rate limiting in project PROJ with type story epic Security priority high"
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **Authentication Errors**
```
Error: Failed to authenticate with Jira
```
**Solution:**
- Verify your Jira host URL
- Check your email and API token
- Ensure your account has proper permissions

#### **Permission Errors**
```
Error: Insufficient permissions to create issues
```
**Solution:**
- Contact your Jira admin
- Request issue creation permissions
- Verify project access

#### **Custom Field Errors**
```
Error: Custom field not found
```
**Solution:**
- Verify custom field IDs in your Jira instance
- Update the field mappings in the code
- Check field permissions

#### **Project Not Found**
```
Error: Project PROJ not found
```
**Solution:**
- Verify project key spelling
- Check project access permissions
- Use correct project key

### **Debug Commands**
```bash
# Test Jira connection
"Test Jira connection"

# List available projects
"List Jira projects"

# Get project details
"Get project details for PROJ"
```

### **Logs and Debugging**
- Check application logs for detailed error messages
- Verify environment variables are set correctly
- Test API connectivity manually

---

## 📞 Support

### **Getting Help**
1. **Check the logs** for detailed error messages
2. **Verify configuration** in your `.env` file
3. **Test connectivity** with simple commands
4. **Create an issue** on GitHub for persistent problems

### **Useful Commands for Debugging**
```bash
# Test basic connectivity
"Help"

# Check Jira status
"What's the status?"

# List available commands
"Show me all Jira commands"
```

---

## 🎯 Best Practices

### **Story Creation**
- Use descriptive titles
- Include acceptance criteria
- Assign appropriate priorities
- Use labels for categorization
- Link to epics when relevant

### **Release Notes**
- Generate from completed sprints
- Include all relevant custom fields
- Review before publishing
- Use consistent versioning

### **Content Generation**
- Provide clear context
- Specify story type and priority
- Include epic information
- Use Copilot suggestions effectively

---

**🎉 You're now ready to use Jira with your release process chatbot!**

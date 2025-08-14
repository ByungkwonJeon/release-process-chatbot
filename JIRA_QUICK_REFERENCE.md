# 🎯 Jira Quick Reference Card

## 🚀 **Quick Start Commands**

### **Release Notes**
```bash
"Generate release notes for version 2.1.0 from sprint 123"
```

### **Create Stories**
```bash
# Simple story
"Create jira story in project PROJ with title User authentication system"

# Detailed story
"Create detailed story in project PROJ with title Payment integration description Secure payment gateway assignee john.doe priority high epic Payment System"
```

### **AI Content Generation**
```bash
"Generate story content for title User authentication system in project PROJ with type story epic User Management priority high"
```

---

## 📋 **Essential Commands**

| Command | Description |
|---------|-------------|
| `"Generate release notes for version X.X.X from sprint XXX"` | Create release notes |
| `"Create jira story in project XXX with title YYY"` | Create simple story |
| `"Create detailed story in project XXX with title YYY description ZZZ"` | Create detailed story |
| `"Generate story content for title YYY in project XXX"` | Generate AI content |
| `"Search for high priority bugs in project XXX"` | Search issues |
| `"Get details for issue XXX-123"` | Get issue details |
| `"Find release candidates for project XXX"` | Find release candidates |

---

## 🔧 **Setup Required**

### **Environment Variables**
```env
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

### **Get API Token**
1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Copy and add to `.env` file

---

## 🏷️ **Custom Fields Supported**

| Field | ID | Usage |
|-------|----|-------|
| Epic | customfield_31603 | `epic Epic Name` |
| Sprint | customfield_10004 | `sprint Sprint 123` |
| Approver | customfield_10545 | `approver john.doe` |
| Reporter Team | customfield_10300 | `reporterTeam Backend Team` |

---

## 🎯 **Common Workflows**

### **Release Process**
```bash
# 1. Generate notes
"Generate release notes for version 2.1.0 from sprint 123"

# 2. Create version
"Create release version 2.1.0 for project PROJ"

# 3. Create follow-up
"Create detailed story in project PROJ with title Post-release monitoring description Monitor system performance assignee ops.team priority medium"
```

### **Sprint Planning**
```bash
# 1. Find incomplete
"Search for issues in sprint 123 with status not Done"

# 2. Create new stories
"Create detailed story in project PROJ with title User feedback system description Implement feedback collection assignee frontend.team priority high epic User Experience sprint Sprint 124"

# 3. Generate content
"Generate story content for title API rate limiting in project PROJ with type story epic Security priority high"
```

---

## 🔍 **Troubleshooting**

### **Common Errors**
- **Authentication failed**: Check JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN
- **Permission denied**: Contact Jira admin for proper permissions
- **Project not found**: Verify project key spelling
- **Custom field error**: Check field IDs in your Jira instance

### **Debug Commands**
```bash
"Help"                    # Show all commands
"Test Jira connection"    # Test connectivity
"List Jira projects"      # List available projects
```

---

## 📞 **Need Help?**

1. Check `JIRA_INSTRUCTIONS.md` for detailed guide
2. Review logs for error messages
3. Verify environment variables
4. Create GitHub issue for persistent problems

---

**🎉 Happy Jira-ing with your chatbot!**

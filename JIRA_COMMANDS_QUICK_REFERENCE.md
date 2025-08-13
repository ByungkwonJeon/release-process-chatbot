# Jira Commands Quick Reference

## 🚀 Getting Started

### Start the Chatbot
```bash
npm start
# Then open http://localhost:3000
```

### Test Authentication
```bash
npm run test:jira
```

## 📋 Essential Commands

### **Release Notes**
```
Generate release notes for version 2.1.0 from sprint 123
```

### **Sprint Management**
```
Get stories from sprint 123
Get active sprints for board 456
Get info for sprint 123
```

### **Story Creation**
```
Create jira story in project PROJ with title User authentication system
Create jira bug in project PROJ with title Login page crashes priority critical
Create jira epic in project PROJ with title Customer Portal Redesign
```

### **Story Management**
```
Get details for story PROJ-123
Update story PROJ-123 status to In Progress
Add comment to story PROJ-123: "Development completed"
```

### **AI Content Generation**
```
Generate story content for title Payment integration in project PROJ with type story epic Payment System priority high
```

## 🎯 Common Workflows

### **Release Process**
```
1. "Get active sprints for board 456"
2. "Generate release notes for version 2.1.0 from sprint 123"
3. "Create jira story in project PROJ with title Deploy version 2.1.0"
```

### **Sprint Planning**
```
1. "Get stories from sprint 123"
2. "Create jira epic in project PROJ with title Sprint 124 Planning"
3. "Generate story content for title New feature in project PROJ"
```

### **Bug Management**
```
1. "Create jira bug in project PROJ with title Critical issue priority critical"
2. "Update story PROJ-789 status to In Progress"
3. "Add comment to story PROJ-789: 'Fix in progress'"
```

## 🔧 Troubleshooting

### **Authentication Issues**
- Check `.sid` file exists: `ls -la ~/.sid`
- Test OAuth2: `npm run test:jira`
- Verify network connection to JPMorgan Chase

### **Permission Issues**
- Verify Jira host URL in `.env`
- Check project access permissions
- Contact Jira administrator

### **Debug Mode**
```env
LOG_LEVEL=debug
```

## 📞 Quick Help

- **Full Guide**: See `JIRA_CHATBOT_USAGE_GUIDE.md`
- **OAuth2 Setup**: See `JIRA_OAUTH2_SETUP.md`
- **Environment Config**: See `env.example`

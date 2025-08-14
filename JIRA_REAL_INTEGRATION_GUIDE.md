# Real Jira Integration Guide

This guide will help you set up real Jira integration for your release process chatbot.

## 🔧 Setup Options

### Option 1: Quick Setup (Recommended)
```bash
npm run setup:jira
```

This interactive script will:
- Create your `.env` file from template
- Prompt for your Jira credentials
- Test the connection automatically

### Option 2: Manual Setup

1. **Create `.env` file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your Jira credentials:**
   ```env
   # Jira Configuration
   JIRA_HOST=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@company.com
   JIRA_API_TOKEN=your-api-token
   ```

## 🔐 Authentication Methods

### Method 1: API Token (Recommended for Cloud)
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "Release Chatbot")
4. Copy the token and add it to your `.env` file

### Method 2: OAuth2 (For JPMorgan Chase ADFS)
If you're using JPMorgan Chase ADFS:

1. **Create `.sid` file in your home directory:**
   ```bash
   echo "your-password" > ~/.sid
   chmod 600 ~/.sid
   ```

2. **The system will automatically use OAuth2 with these settings:**
   ```env
   JIRA_ADFS_URL=https://idaq2.jpmorganchase.com/adfs/oauth2/token
   JIRA_CLIENT_ID=PC-111661-SID-277611-PROD
   JIRA_RESOURCE=JPMC:URI:RS-25188-87400-Jira0authAPI-PROD
   ```

## 🧪 Testing the Integration

### Test Connection
```bash
npm run setup:jira
```

### Test in Chatbot
Once configured, test these commands in your chatbot:

1. **Get Sprint Stories:**
   ```
   Get stories from sprint 123
   ```

2. **Get Active Sprints:**
   ```
   Get active sprints
   ```

3. **Generate Release Notes:**
   ```
   Generate release notes for version 2.1.0 from sprint 123
   ```

4. **Get Sprint Info:**
   ```
   Get info for sprint 123
   ```

## 📋 Available Jira Commands

### Sprint Management
- `Get stories from sprint 123` - Fetch all stories from a specific sprint
- `Get info for sprint 123` - Get detailed sprint information
- `Get active sprints` - List all active sprints
- `Get active sprints for board 456` - List sprints for specific board

### Release Management
- `Generate release notes for version 2.1.0 from sprint 123` - Generate release notes from sprint

### Story Management
- `Create jira story in project PROJ with title User authentication system` - Create detailed stories
- `Create detailed story in project PROJ with title Payment integration description Secure payment gateway assignee john.doe priority high epic Payment System sprint Sprint 123 labels payment,integration` - Create comprehensive stories

### Advanced Features
- `Find release candidates for project PROJ` - Find issues ready for release
- `Create release version 2.1.0 for project PROJ` - Create Jira version
- `Get development info for PROJ-123` - Get commits, PRs, branches
- `Search for high priority bugs in project PROJ` - Search issues

## 🔍 Troubleshooting

### Connection Issues
1. **Check credentials:** Verify your Jira host, email, and API token
2. **Test manually:** Try accessing your Jira instance in a browser
3. **Check permissions:** Ensure your user has access to the projects/sprints

### OAuth2 Issues (JPMorgan Chase)
1. **Check `.sid` file:** Ensure it exists and contains your password
2. **File permissions:** Make sure `.sid` file has correct permissions (600)
3. **Network access:** Ensure you can reach the ADFS server

### Common Error Messages
- `"Failed to obtain Jira access token"` - Check OAuth2 credentials
- `"Jira credentials validation failed"` - Check API token or OAuth2 setup
- `"Failed to fetch sprint stories"` - Check sprint ID and permissions

## 🔒 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Secure `.sid` file** - Use `chmod 600 ~/.sid` for OAuth2
3. **Rotate API tokens** - Regularly update your API tokens
4. **Use least privilege** - Only grant necessary permissions to API tokens

## 📊 What You Get

With real Jira integration, your chatbot can:

✅ **Fetch real sprint data** from your Jira instance
✅ **Generate actual release notes** with real story information
✅ **Create real Jira stories** through the chatbot
✅ **Search and manage issues** across your projects
✅ **Track release candidates** and versions
✅ **Access sprint information** and board data

## 🚀 Next Steps

After setting up real Jira integration:

1. **Test basic commands** to ensure everything works
2. **Configure your projects** and sprint IDs
3. **Set up release workflows** using the chatbot
4. **Integrate with your CI/CD** pipeline
5. **Customize release note templates** if needed

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Jira instance is accessible
3. Test with a simple API call first
4. Check the logs for detailed error messages

---

**🎉 Congratulations!** You now have real Jira integration with your release process chatbot!

# Jira OAuth2 Configuration for MCP Integration

This guide will help you set up Jira OAuth2 authentication for the Model Context Protocol (MCP) integration in your release process chatbot.

## 🔧 Quick Setup

### Option 1: Interactive Setup (Recommended)
```bash
npm run setup:jira:oauth2
```

### Option 2: Manual Configuration
1. Update your `.env` file with OAuth2 settings
2. Create `.sid` file in your home directory
3. Test the connection

## 📋 Required Configuration

### Environment Variables (.env file)
```bash
# Jira OAuth2 Configuration
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_ADFS_URL=https://idaq2.jpmorganchase.com/adfs/oauth2/token
JIRA_CLIENT_ID=PC-111661-SID-277611-PROD
JIRA_RESOURCE=JPMC:URI:RS-25188-87400-Jira0authAPI-PROD

# Remove or comment out API token (not needed for OAuth2)
# JIRA_API_TOKEN=your-api-token
```

### Password File (.sid)
Create a `.sid` file in your home directory containing your password:
```bash
echo "your-password" > ~/.sid
```

## 🔍 Testing OAuth2 Authentication

### Test Connection
```bash
npm run test:jira:oauth2
```

### Expected Output
```
🔍 Testing Jira OAuth2 Authentication for MCP Integration...

📋 Environment Variables:
   JIRA_HOST: https://your-domain.atlassian.net
   JIRA_EMAIL: your-email@company.com
   JIRA_ADFS_URL: https://idaq2.jpmorganchase.com/adfs/oauth2/token
   JIRA_CLIENT_ID: PC-111661-SID-277611-PROD
   JIRA_RESOURCE: JPMC:URI:RS-25188-87400-Jira0authAPI-PROD

📁 .sid File Check:
   ✅ .sid file found in home directory
   📝 File size: 12 characters

🧪 Testing Jira OAuth2 connection...
✅ Jira OAuth2 authentication successful!
📋 Message: Enhanced Jira OAuth2 credentials are valid

🧪 Testing API call (getProjects)...
✅ API call successful!
📋 Found 15 projects
```

## 🚀 Available Jira Commands

Once OAuth2 is configured, you can use these commands in the chatbot:

### Sprint Management
- `Get stories from sprint 123`
- `Get sprint info for 123`
- `Get active sprints for board 456`
- `Generate release notes for version 2.1.0 from sprint 123`

### Issue Management
- `Search issues with JQL "project = PROJ AND status = Done"`
- `Get issue details for PROJ-123`
- `Create story in project PROJ with title "New Feature"`
- `Create detailed story in project PROJ with title "Complex Feature" priority high epic "Epic Name"`

### Project Management
- `Get all projects`
- `Get scrum boards`
- `Get release candidates for project PROJ`
- `Create release version 2.1.0 for project PROJ`

### Story Content Generation
- `Generate story content for "Feature Title" in project PROJ`
- `Create comprehensive story in project PROJ with title "AI Feature"`

## 🔧 Troubleshooting

### Common Issues

#### 1. ".sid file not found"
```bash
# Create .sid file
echo "your-password" > ~/.sid
```

#### 2. "Failed to obtain Jira OAuth2 access token"
- Check your password in `.sid` file
- Verify ADFS URL is accessible
- Ensure client ID and resource are correct

#### 3. "401 Unauthorized" or "403 Forbidden"
- Your credentials may be expired
- Update password in `.sid` file
- Check with Jira administrator

#### 4. "ADFS connection failed"
- Verify network connectivity to ADFS server
- Check ADFS URL is correct
- Ensure you're on the corporate network (if required)

### Debug Steps

1. **Check Environment Variables**
   ```bash
   npm run test:jira:oauth2
   ```

2. **Verify .sid File**
   ```bash
   ls -la ~/.sid
   cat ~/.sid
   ```

3. **Test ADFS Connectivity**
   ```bash
   curl -I https://idaq2.jpmorganchase.com/adfs/oauth2/token
   ```

4. **Reconfigure OAuth2**
   ```bash
   npm run setup:jira:oauth2
   ```

## 🔒 Security Notes

### Password Storage
- The `.sid` file contains your password in plain text
- Ensure proper file permissions: `chmod 600 ~/.sid`
- Never commit `.sid` file to version control

### Token Management
- OAuth2 tokens are automatically cached and refreshed
- Tokens expire based on ADFS configuration
- Failed token refresh will prompt for new password

### Network Security
- OAuth2 requests go through ADFS server
- Ensure corporate network access if required
- Use VPN if accessing from external networks

## 📚 Advanced Configuration

### Custom ADFS Settings
If your organization uses different ADFS settings:

```bash
# Update .env file
JIRA_ADFS_URL=https://your-adfs-server.com/adfs/oauth2/token
JIRA_CLIENT_ID=your-client-id
JIRA_RESOURCE=your-resource-identifier
```

### Multiple Jira Instances
For multiple Jira instances, you can create separate configuration files:

```bash
# .env.prod
JIRA_HOST=https://prod-jira.company.com
JIRA_EMAIL=prod-user@company.com

# .env.dev
JIRA_HOST=https://dev-jira.company.com
JIRA_EMAIL=dev-user@company.com
```

## 🎯 Next Steps

1. **Test Basic Commands**: Try simple commands like "Get all projects"
2. **Explore Sprint Features**: Test sprint-related commands
3. **Generate Release Notes**: Create release notes from sprints
4. **Create Stories**: Use story creation commands
5. **Integrate with Workflow**: Connect with your release process

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Run `npm run test:jira:oauth2` for diagnostics
3. Verify your Jira administrator settings
4. Check network connectivity to ADFS server

---

**Note**: This OAuth2 configuration is specifically designed for JPMorgan Chase ADFS integration. For other organizations, you may need to adjust the ADFS URL, client ID, and resource values according to your organization's configuration.

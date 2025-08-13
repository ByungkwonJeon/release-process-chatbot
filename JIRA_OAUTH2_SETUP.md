# Jira OAuth2 Authentication Setup

This document explains how to set up and use OAuth2 authentication for Jira API access in the release process chatbot.

## Overview

The chatbot now supports OAuth2 authentication for Jira API access, specifically configured for JPMorgan Chase ADFS (Active Directory Federation Services). This replaces the previous API token-based authentication.

## Prerequisites

1. **JPMorgan Chase Network Access**: You must be connected to the JPMorgan Chase network (VPN or on-site)
2. **User Account**: A valid JPMorgan Chase user account
3. **SID File**: A `.sid` file in your home directory containing your password

## Setup Instructions

### 1. Create the SID File

Create a `.sid` file in your home directory with your JPMorgan Chase password:

```bash
# On macOS/Linux
echo "your-password" > ~/.sid

# On Windows
echo your-password > %USERPROFILE%\.sid
```

**Important**: Ensure the file has appropriate permissions:
```bash
chmod 600 ~/.sid
```

### 2. Environment Configuration

Update your `.env` file with the following Jira OAuth2 configuration:

```env
# Jira Configuration
JIRA_HOST=https://your-jira-instance.atlassian.net
JIRA_EMAIL=your-email@jpmorganchase.com
JIRA_API_TOKEN=your-api-token  # Optional, kept for backward compatibility

# Jira OAuth2 Configuration (for JPMorgan Chase ADFS)
JIRA_ADFS_URL=https://idaq2.jpmorganchase.com/adfs/oauth2/token
JIRA_CLIENT_ID=PC-111661-SID-277611-PROD
JIRA_RESOURCE=JPMC:URI:RS-25188-87400-Jira0authAPI-PROD
```

### 3. Install Dependencies

Install the required dependencies:

```bash
npm install
```

## How It Works

### Token Management

The OAuth2 implementation includes automatic token management:

1. **Token Caching**: Access tokens are cached in memory to avoid repeated authentication requests
2. **Automatic Refresh**: Tokens are automatically refreshed when they expire
3. **Error Handling**: Comprehensive error handling for authentication failures

### Authentication Flow

1. **Token Check**: Before each API request, the system checks if a valid token exists
2. **Token Retrieval**: If no valid token exists, it requests a new one from the ADFS endpoint
3. **Request Execution**: API requests are made with the Bearer token in the Authorization header

## Testing the Setup

Run the Jira OAuth2 test to verify your configuration:

```bash
npm run test:jira
```

This will test:
- Access token retrieval
- Credential validation
- User info retrieval

## API Methods

All existing Jira API methods now use OAuth2 authentication:

- `getSprintStories(sprintId)` - Get stories from a sprint
- `generateReleaseNotes(sprintId, version)` - Generate release notes
- `getSprintInfo(sprintId)` - Get sprint information
- `getActiveSprints(boardId)` - Get active sprints for a board
- `validateCredentials()` - Validate authentication credentials

## Troubleshooting

### Common Issues

1. **"Failed to obtain Jira access token"**
   - Ensure you're connected to the JPMorgan Chase network
   - Verify your `.sid` file exists and contains the correct password
   - Check that the ADFS URL is accessible

2. **"Jira credentials validation failed"**
   - Verify your Jira host URL is correct
   - Ensure you have access to the Jira instance
   - Check that the OAuth2 configuration is correct

3. **"ENOENT: no such file or directory"**
   - Ensure the `.sid` file exists in your home directory
   - Check file permissions (should be 600)

### Debug Mode

Enable debug logging by setting the log level:

```env
LOG_LEVEL=debug
```

### Manual Token Testing

You can manually test token retrieval:

```javascript
const jiraService = require('./src/services/jira');

async function testToken() {
  try {
    const token = await jiraService.getAccessToken();
    console.log('Token obtained:', token.substring(0, 20) + '...');
  } catch (error) {
    console.error('Token error:', error.message);
  }
}

testToken();
```

## Security Considerations

1. **SID File Security**: Keep your `.sid` file secure and never commit it to version control
2. **Token Storage**: Tokens are stored in memory only and are not persisted
3. **Network Security**: Ensure you're on a secure network when accessing the ADFS endpoint
4. **File Permissions**: Set appropriate file permissions on the `.sid` file (600)

## Migration from API Token

If you were previously using API token authentication:

1. The system will automatically use OAuth2 authentication
2. API token configuration is kept for backward compatibility
3. No changes are needed to existing code that uses the Jira service

## Support

For issues related to:
- **OAuth2 Configuration**: Check this documentation
- **JPMorgan Chase ADFS**: Contact your IT support
- **Jira Access**: Contact your Jira administrator
- **Application Issues**: Check the application logs and error messages

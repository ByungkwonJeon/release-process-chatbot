const { Tool } = require('@modelcontextprotocol/sdk/dist/cjs/server/tools');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const { logger } = require('../../utils/logger');
const { getUserName, getHomeDir } = require('../../utils/userUtils');

class EnhancedJiraTool extends Tool {
  constructor() {
    super({
      name: 'enhancedJira',
      description: 'Enhanced Jira integration with release workflow features and advanced capabilities using OAuth2 authentication',
      version: '2.0.0'
    });

    this.host = process.env.JIRA_HOST;
    this.email = process.env.JIRA_EMAIL;
    this.adfsUrl = process.env.JIRA_ADFS_URL || 'https://idaq2.jpmorganchase.com/adfs/oauth2/token';
    this.clientId = process.env.JIRA_CLIENT_ID || 'PC-111661-SID-277611-PROD';
    this.resource = process.env.JIRA_RESOURCE || 'JPMC:URI:RS-25188-87400-Jira0authAPI-PROD';
    
    // Token cache
    this.token = {
      token: null,
      time: null
    };
    
    this.client = axios.create({
      baseURL: this.host,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get OAuth2 access token for Jira API
   * @returns {Promise<string>} The access token
   */
  async getAccessToken() {
    const time = new Date();
    
    // Check if we have a valid cached token
    if (this.token.token != null && this.token.time.getTime() > time.getTime()) {
      return this.token.token;
    }

    try {
      // Read password from .sid file in home directory
      const password = fs.readFileSync(`${getHomeDir()}/.sid`).toString().trim();
      
      // Construct OAuth2 request data
      const data = qs.stringify({
        'grant_type': 'password',
        'client_id': this.clientId,
        'resource': this.resource,
        'username': `NAEAST\\${getUserName()}`,
        'password': password
      });

      // Make OAuth2 token request
      const response = await axios.post(this.adfsUrl, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Cache the token and expiry time
      this.token.token = response.data.access_token;
      this.token.time = new Date(time.getTime() + (response.data.expires_in * 1000));
      
      logger.info('Successfully obtained new Jira OAuth2 access token');
      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to obtain Jira OAuth2 access token:', error.message);
      throw new Error(`Failed to obtain Jira access token: ${error.message}`);
    }
  }

  /**
   * Update client headers with current access token
   */
  async updateClientAuth() {
    try {
      const accessToken = await this.getAccessToken();
      this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      logger.error('Failed to update client authentication:', error.message);
      throw error;
    }
  }

  // ===== RELEASE WORKFLOW FEATURES (Our Custom Implementation) =====

  async getSprintStories(args) {
    try {
      const { sprintId } = args;
      
      if (!sprintId) {
        throw new Error('Sprint ID is required');
      }

      logger.info(`Fetching stories for sprint: ${sprintId}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const jql = `sprint = ${sprintId} ORDER BY priority DESC, created ASC`;
      const response = await this.client.post('/rest/api/3/search', {
        jql,
        maxResults: 100,
        fields: [
          'summary',
          'description',
          'status',
          'priority',
          'issuetype',
          'assignee',
          'components',
          'labels',
          'fixVersions',
          'created',
          'updated',
          'customfield_31603', // Epic
          'customfield_10004', // Sprint
          'customfield_10545', // Approver
          'customfield_10300'  // Reporter Team
        ]
      });

      const issues = response.data.issues || [];
      logger.info(`Found ${issues.length} stories in sprint ${sprintId}`);
      
      const stories = issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name,
        type: issue.fields.issuetype.name,
        assignee: issue.fields.assignee?.displayName,
        components: issue.fields.components?.map(c => c.name) || [],
        labels: issue.fields.labels || [],
        fixVersions: issue.fields.fixVersions?.map(v => v.name) || [],
        created: issue.fields.created,
        updated: issue.fields.updated,
        epic: issue.fields.customfield_31603?.value || null,
        sprint: issue.fields.customfield_10004?.name || null,
        approver: issue.fields.customfield_10545?.displayName || null,
        reporterTeam: issue.fields.customfield_10300?.value || null
      }));
      
      return {
        success: true,
        stories,
        total: stories.length,
        sprintId,
        message: `Retrieved ${stories.length} stories from sprint ${sprintId}`
      };
    } catch (error) {
      logger.error('Failed to fetch sprint stories:', error.response?.data || error.message);
      throw new Error(`Failed to fetch sprint stories: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async generateReleaseNotes(args) {
    try {
      const { sprintId, version } = args;
      
      if (!sprintId || !version) {
        throw new Error('Sprint ID and version are required');
      }

      logger.info(`Generating release notes for version ${version} from sprint ${sprintId}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const storiesResult = await this.getSprintStories({ sprintId });
      const stories = storiesResult.stories;
      
      // Group stories by type
      const features = stories.filter(s => s.type === 'Story' || s.type === 'New Feature');
      const bugs = stories.filter(s => s.type === 'Bug');
      const improvements = stories.filter(s => s.type === 'Improvement' || s.type === 'Task');
      
      let releaseNotes = `# Release Notes - Version ${version}\n\n`;
      releaseNotes += `**Release Date:** ${new Date().toLocaleDateString()}\n`;
      releaseNotes += `**Sprint:** ${sprintId}\n\n`;
      
      if (features.length > 0) {
        releaseNotes += `## 🚀 New Features\n\n`;
        features.forEach(story => {
          releaseNotes += `- **${story.key}:** ${story.summary}\n`;
          releaseNotes += `  - **Status:** ${story.status}\n`;
          if (story.epic) releaseNotes += `  - **Epic:** ${story.epic}\n`;
          if (story.sprint) releaseNotes += `  - **Sprint:** ${story.sprint}\n`;
          if (story.approver) releaseNotes += `  - **Approver:** ${story.approver}\n`;
          if (story.reporterTeam) releaseNotes += `  - **Reporter Team:** ${story.reporterTeam}\n`;
          releaseNotes += '\n';
        });
        releaseNotes += '\n';
      }
      
      if (improvements.length > 0) {
        releaseNotes += `## 🔧 Improvements\n\n`;
        improvements.forEach(story => {
          releaseNotes += `- **${story.key}:** ${story.summary}\n`;
          releaseNotes += `  - **Status:** ${story.status}\n`;
          if (story.epic) releaseNotes += `  - **Epic:** ${story.epic}\n`;
          if (story.sprint) releaseNotes += `  - **Sprint:** ${story.sprint}\n`;
          if (story.approver) releaseNotes += `  - **Approver:** ${story.approver}\n`;
          if (story.reporterTeam) releaseNotes += `  - **Reporter Team:** ${story.reporterTeam}\n`;
          releaseNotes += '\n';
        });
        releaseNotes += '\n';
      }
      
      if (bugs.length > 0) {
        releaseNotes += `## 🐛 Bug Fixes\n\n`;
        bugs.forEach(story => {
          releaseNotes += `- **${story.key}:** ${story.summary}\n`;
          releaseNotes += `  - **Status:** ${story.status}\n`;
          if (story.epic) releaseNotes += `  - **Epic:** ${story.epic}\n`;
          if (story.sprint) releaseNotes += `  - **Sprint:** ${story.sprint}\n`;
          if (story.approver) releaseNotes += `  - **Approver:** ${story.approver}\n`;
          if (story.reporterTeam) releaseNotes += `  - **Reporter Team:** ${story.reporterTeam}\n`;
          releaseNotes += '\n';
        });
        releaseNotes += '\n';
      }
      
      releaseNotes += `## 📊 Summary\n\n`;
      releaseNotes += `- Total Stories: ${stories.length}\n`;
      releaseNotes += `- Features: ${features.length}\n`;
      releaseNotes += `- Improvements: ${improvements.length}\n`;
      releaseNotes += `- Bug Fixes: ${bugs.length}\n`;
      
      // Add custom field statistics
      const epics = [...new Set(stories.filter(s => s.epic).map(s => s.epic))];
      const approvers = [...new Set(stories.filter(s => s.approver).map(s => s.approver))];
      const reporterTeams = [...new Set(stories.filter(s => s.reporterTeam).map(s => s.reporterTeam))];
      
      if (epics.length > 0) {
        releaseNotes += `- Epics: ${epics.length} (${epics.join(', ')})\n`;
      }
      if (approvers.length > 0) {
        releaseNotes += `- Approvers: ${approvers.length} (${approvers.join(', ')})\n`;
      }
      if (reporterTeams.length > 0) {
        releaseNotes += `- Reporter Teams: ${reporterTeams.length} (${reporterTeams.join(', ')})\n`;
      }
      
      logger.info(`Generated release notes for version ${version}`);
      
      return {
        success: true,
        releaseNotes,
        summary: {
          total: stories.length,
          features: features.length,
          improvements: improvements.length,
          bugs: bugs.length
        },
        version,
        sprintId,
        message: `Release notes generated successfully for version ${version}`
      };
    } catch (error) {
      logger.error('Failed to generate release notes:', error.message);
      throw error;
    }
  }

  async getActiveSprints(args) {
    try {
      const { boardId } = args;
      
      if (!boardId) {
        throw new Error('Board ID is required');
      }

      // Update authentication before making request
      await this.updateClientAuth();

      const response = await this.client.get(`/rest/agile/1.0/board/${boardId}/sprint`, {
        params: {
          state: 'active'
        }
      });
      
      const sprints = response.data.values || [];
      
      return {
        success: true,
        sprints,
        total: sprints.length,
        boardId,
        message: `Retrieved ${sprints.length} active sprints from board ${boardId}`
      };
    } catch (error) {
      logger.error('Failed to get active sprints:', error.response?.data || error.message);
      throw new Error(`Failed to get active sprints: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  // ===== ADVANCED JIRA FEATURES (Enhanced Capabilities) =====

  async searchIssues(args) {
    try {
      const { jql, maxResults = 50, fields = ['summary', 'status', 'priority', 'issuetype'] } = args;
      
      if (!jql) {
        throw new Error('JQL query is required');
      }

      logger.info(`Searching issues with JQL: ${jql}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.post('/rest/api/3/search', {
        jql,
        maxResults,
        fields
      });

      const issues = response.data.issues || [];
      
      return {
        success: true,
        issues: issues.map(issue => ({
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status?.name,
          priority: issue.fields.priority?.name,
          type: issue.fields.issuetype?.name,
          assignee: issue.fields.assignee?.displayName,
          reporter: issue.fields.reporter?.displayName,
          created: issue.fields.created,
          updated: issue.fields.updated
        })),
        total: response.data.total,
        maxResults: response.data.maxResults,
        message: `Found ${issues.length} issues matching the query`
      };
    } catch (error) {
      logger.error('Failed to search issues:', error.response?.data || error.message);
      throw new Error(`Failed to search issues: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getIssueDetails(args) {
    try {
      const { issueKey, expand = 'changelog,comments' } = args;
      
      if (!issueKey) {
        throw new Error('Issue key is required');
      }

      logger.info(`Getting details for issue: ${issueKey}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}`, {
        params: { expand }
      });

      const issue = response.data;
      
      return {
        success: true,
        issue: {
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description,
          status: issue.fields.status?.name,
          priority: issue.fields.priority?.name,
          type: issue.fields.issuetype?.name,
          assignee: issue.fields.assignee?.displayName,
          reporter: issue.fields.reporter?.displayName,
          components: issue.fields.components?.map(c => c.name) || [],
          labels: issue.fields.labels || [],
          fixVersions: issue.fields.fixVersions?.map(v => v.name) || [],
          created: issue.fields.created,
          updated: issue.fields.updated,
          comments: issue.fields.comment?.comments || [],
          changelog: issue.changelog?.histories || [],
          epic: issue.fields.customfield_31603?.value || null,
          sprint: issue.fields.customfield_10004?.name || null,
          approver: issue.fields.customfield_10545?.displayName || null,
          reporterTeam: issue.fields.customfield_10300?.value || null
        },
        message: `Retrieved details for issue ${issueKey}`
      };
    } catch (error) {
      logger.error(`Failed to get issue details for ${issueKey}:`, error.response?.data || error.message);
      throw new Error(`Failed to get issue details: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getProjects(args) {
    try {
      logger.info('Fetching Jira projects');
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.get('/rest/api/3/project');
      const projects = response.data || [];
      
      return {
        success: true,
        projects: projects.map(project => ({
          key: project.key,
          name: project.name,
          id: project.id,
          projectTypeKey: project.projectTypeKey,
          simplified: project.simplified,
          style: project.style,
          isPrivate: project.isPrivate
        })),
        total: projects.length,
        message: `Retrieved ${projects.length} projects`
      };
    } catch (error) {
      logger.error('Failed to fetch projects:', error.response?.data || error.message);
      throw new Error(`Failed to fetch projects: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getBoards(args) {
    try {
      const { type = 'scrum' } = args;
      
      logger.info(`Fetching ${type} boards`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.get('/rest/agile/1.0/board', {
        params: { type }
      });
      
      const boards = response.data.values || [];
      
      return {
        success: true,
        boards: boards.map(board => ({
          id: board.id,
          name: board.name,
          type: board.type,
          location: board.location
        })),
        total: boards.length,
        message: `Retrieved ${boards.length} ${type} boards`
      };
    } catch (error) {
      logger.error('Failed to fetch boards:', error.response?.data || error.message);
      throw new Error(`Failed to fetch boards: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async createIssue(args) {
    try {
      const { projectKey, summary, description, issueType = 'Task', assignee = null } = args;
      
      if (!projectKey || !summary) {
        throw new Error('Project key and summary are required');
      }

      logger.info(`Creating issue in project ${projectKey}: ${summary}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const issueData = {
        fields: {
          project: { key: projectKey },
          summary: summary,
          description: description || '',
          issuetype: { name: issueType }
        }
      };

      if (assignee) {
        issueData.fields.assignee = { name: assignee };
      }

      const response = await this.client.post('/rest/api/3/issue', issueData);
      
      return {
        success: true,
        issue: {
          key: response.data.key,
          id: response.data.id,
          summary: summary,
          projectKey: projectKey,
          issueType: issueType
        },
        message: `Created issue ${response.data.key} successfully`
      };
    } catch (error) {
      logger.error('Failed to create issue:', error.response?.data || error.message);
      throw new Error(`Failed to create issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async createDetailedIssue(args) {
    try {
      const { 
        projectKey, 
        summary, 
        description, 
        issueType = 'Story', 
        assignee = null, 
        priority = 'Medium',
        epic = null,
        sprint = null,
        labels = [],
        components = [],
        fixVersions = []
      } = args;
      
      if (!projectKey || !summary) {
        throw new Error('Project key and summary are required');
      }

      logger.info(`Creating detailed issue in project ${projectKey}: ${summary}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const issueData = {
        fields: {
          project: { key: projectKey },
          summary: summary,
          description: description || '',
          issuetype: { name: issueType },
          priority: { name: priority }
        }
      };

      // Add assignee if provided
      if (assignee) {
        issueData.fields.assignee = { name: assignee };
      }

      // Add labels if provided
      if (labels && labels.length > 0) {
        issueData.fields.labels = labels;
      }

      // Add components if provided
      if (components && components.length > 0) {
        issueData.fields.components = components.map(name => ({ name }));
      }

      // Add fix versions if provided
      if (fixVersions && fixVersions.length > 0) {
        issueData.fields.fixVersions = fixVersions.map(name => ({ name }));
      }

      // Add custom fields if provided
      if (epic) {
        issueData.fields.customfield_31603 = { value: epic }; // Epic field
      }

      if (sprint) {
        issueData.fields.customfield_10004 = { name: sprint }; // Sprint field
      }

      const response = await this.client.post('/rest/api/3/issue', issueData);
      
      return {
        success: true,
        issue: {
          key: response.data.key,
          id: response.data.id,
          summary: summary,
          projectKey: projectKey,
          issueType: issueType,
          priority: priority,
          assignee: assignee,
          labels: labels,
          components: components,
          fixVersions: fixVersions,
          epic: epic,
          sprint: sprint
        },
        message: `Created detailed issue ${response.data.key} successfully`
      };
    } catch (error) {
      logger.error('Failed to create detailed issue:', error.response?.data || error.message);
      throw new Error(`Failed to create detailed issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async updateIssue(args) {
    try {
      const { issueKey, fields } = args;
      
      if (!issueKey || !fields) {
        throw new Error('Issue key and fields are required');
      }

      logger.info(`Updating issue ${issueKey}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.put(`/rest/api/3/issue/${issueKey}`, {
        fields: fields
      });
      
      return {
        success: true,
        issueKey,
        message: `Updated issue ${issueKey} successfully`
      };
    } catch (error) {
      logger.error(`Failed to update issue ${issueKey}:`, error.response?.data || error.message);
      throw new Error(`Failed to update issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async transitionIssue(args) {
    try {
      const { issueKey, transitionId, comment = null } = args;
      
      if (!issueKey || !transitionId) {
        throw new Error('Issue key and transition ID are required');
      }

      logger.info(`Transitioning issue ${issueKey} to transition ${transitionId}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const transitionData = {
        transition: { id: transitionId }
      };

      if (comment) {
        transitionData.update = {
          comment: [{ add: { body: comment } }]
        };
      }

      await this.client.post(`/rest/api/3/issue/${issueKey}/transitions`, transitionData);
      
      return {
        success: true,
        issueKey,
        transitionId,
        message: `Transitioned issue ${issueKey} successfully`
      };
    } catch (error) {
      logger.error(`Failed to transition issue ${issueKey}:`, error.response?.data || error.message);
      throw new Error(`Failed to transition issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async generateStoryContent(args) {
    try {
      const { title, issueType = 'Story', projectKey, epic = null, sprint = null, assignee = null, priority = 'Medium' } = args;
      
      if (!title) {
        throw new Error('Story title is required');
      }

      logger.info(`Generating story content for: ${title}`);

      // Generate comprehensive description using AI
      const descriptionPrompt = `Generate a detailed description for a ${issueType} titled "${title}" in project ${projectKey || 'PROJ'}.
      
Context:
- Issue Type: ${issueType}
- Project: ${projectKey || 'PROJ'}
- Epic: ${epic || 'None'}
- Sprint: ${sprint || 'None'}
- Assignee: ${assignee || 'Unassigned'}
- Priority: ${priority}

Please provide:
1. A comprehensive description explaining the feature/requirement
2. Business value and impact
3. Technical considerations
4. Dependencies and prerequisites
5. Success criteria

Format the response in markdown with clear sections.`;

      // Generate acceptance criteria using AI
      const acceptanceCriteriaPrompt = `Generate detailed acceptance criteria for a ${issueType} titled "${title}".
      
Context:
- Issue Type: ${issueType}
- Project: ${projectKey || 'PROJ'}
- Epic: ${epic || 'None'}
- Priority: ${priority}

Please provide:
1. Functional requirements (Given-When-Then format)
2. Non-functional requirements
3. Edge cases and error scenarios
4. Performance requirements
5. Security considerations
6. Testing requirements

Format as a numbered list with clear, testable criteria.`;

      // For now, we'll generate structured content based on the title and context
      // In a real implementation, this would call an AI service like OpenAI or GitHub Copilot API
      
      const description = this.generateStructuredDescription(title, issueType, projectKey, epic, sprint, assignee, priority);
      const acceptanceCriteria = this.generateAcceptanceCriteria(title, issueType, projectKey, epic, priority);

      return {
        success: true,
        content: {
          description,
          acceptanceCriteria,
          copilotSuggestions: this.generateCopilotSuggestions(title, issueType)
        },
        message: `Generated story content for "${title}"`
      };
    } catch (error) {
      logger.error('Failed to generate story content:', error.message);
      throw new Error(`Failed to generate story content: ${error.message}`);
    }
  }

  generateStructuredDescription(title, issueType, projectKey, epic, sprint, assignee, priority) {
    const project = projectKey || 'PROJ';
    
    return `## Overview
This ${issueType.toLowerCase()} implements ${title} to enhance the system's functionality and user experience.

## Business Value
- Improves user workflow efficiency
- Addresses specific business requirements
- Contributes to overall project goals
- Supports ${epic || 'project'} objectives

## Technical Requirements
- Implement ${title} following established patterns
- Ensure compatibility with existing systems
- Follow coding standards and best practices
- Include proper error handling and logging

## Dependencies
- Existing system infrastructure
- Related components and services
- Database schema updates (if required)
- Third-party integrations (if applicable)

## Success Criteria
- Feature is fully functional and tested
- Performance meets defined requirements
- Documentation is complete and accurate
- Code review is approved
- Integration tests pass successfully

## Additional Notes
- Priority: ${priority}
- Epic: ${epic || 'None'}
- Sprint: ${sprint || 'None'}
- Assignee: ${assignee || 'Unassigned'}`;
  }

  generateAcceptanceCriteria(title, issueType, projectKey, epic, priority) {
    return `## Functional Requirements

1. **Core Functionality**
   - Given a user accesses the system
   - When they interact with ${title}
   - Then the feature works as expected

2. **User Interface**
   - Given the user interface is loaded
   - When ${title} is displayed
   - Then all elements are properly rendered and functional

3. **Data Handling**
   - Given data is processed by ${title}
   - When operations are performed
   - Then data integrity is maintained

## Non-Functional Requirements

4. **Performance**
   - Response time is under 2 seconds
   - System handles expected load without degradation
   - Memory usage remains within acceptable limits

5. **Security**
   - All inputs are properly validated and sanitized
   - Authentication and authorization are enforced
   - Sensitive data is protected

6. **Compatibility**
   - Works across supported browsers and devices
   - Maintains backward compatibility
   - Integrates seamlessly with existing systems

## Edge Cases and Error Scenarios

7. **Error Handling**
   - System gracefully handles invalid inputs
   - Appropriate error messages are displayed
   - System recovers from failures

8. **Boundary Conditions**
   - Handles maximum/minimum data values
   - Manages concurrent user access
   - Processes large datasets efficiently

## Testing Requirements

9. **Test Coverage**
   - Unit tests cover all critical paths
   - Integration tests verify system interactions
   - End-to-end tests validate user workflows

10. **Quality Assurance**
    - Code review is completed
    - Performance testing is performed
    - Security testing is conducted`;
  }

  generateCopilotSuggestions(title, issueType) {
    return {
      vscodeCommands: [
        `// Generate description for: ${title}`,
        `// Type: ${issueType}`,
        `// Use GitHub Copilot to enhance this description`,
        `// Suggested prompt: "Write a detailed description for a ${issueType.toLowerCase()} about ${title}"`
      ],
      copilotPrompts: [
        `Write a comprehensive description for a ${issueType.toLowerCase()} titled "${title}" including business value, technical requirements, and success criteria.`,
        `Generate acceptance criteria for "${title}" in Given-When-Then format with functional and non-functional requirements.`,
        `Create test scenarios for "${title}" covering happy path, edge cases, and error conditions.`,
        `Write technical implementation notes for "${title}" including architecture considerations and best practices.`
      ],
      vscodeIntegration: {
        description: `To use GitHub Copilot in VS Code for this story:
1. Open the story in Jira
2. Click "Edit" on the description field
3. Use Ctrl+Shift+I (Cmd+Shift+I on Mac) to trigger Copilot
4. Type: "Write a detailed description for ${title}"
5. Press Tab to accept Copilot suggestions`,
        acceptanceCriteria: `To generate acceptance criteria with Copilot:
1. In the acceptance criteria field
2. Use Ctrl+Shift+I to trigger Copilot
3. Type: "Generate acceptance criteria for ${title} in Given-When-Then format"
4. Press Tab to accept suggestions
5. Review and refine the generated criteria`
      }
    };
  }

  async getDevInfo(args) {
    try {
      const { issueKey } = args;
      
      if (!issueKey) {
        throw new Error('Issue key is required');
      }

      logger.info(`Getting development info for issue: ${issueKey}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      // Get commits and pull requests related to the issue
      const response = await this.client.get(`/rest/dev-status/1.0/pull-request/${issueKey}`);
      
      return {
        success: true,
        issueKey,
        devInfo: {
          pullRequests: response.data.detail || [],
          commits: response.data.commits || [],
          branches: response.data.branches || []
        },
        message: `Retrieved development info for issue ${issueKey}`
      };
    } catch (error) {
      logger.error(`Failed to get dev info for ${issueKey}:`, error.response?.data || error.message);
      // Return empty dev info if not available
      return {
        success: true,
        issueKey,
        devInfo: {
          pullRequests: [],
          commits: [],
          branches: []
        },
        message: `No development info available for issue ${issueKey}`
      };
    }
  }

  async validateCredentials() {
    try {
      // Update authentication before making request
      await this.updateClientAuth();
      
      await this.client.get('/rest/api/3/myself');
      return {
        success: true,
        message: 'Enhanced Jira OAuth2 credentials are valid'
      };
    } catch (error) {
      logger.error('Enhanced Jira OAuth2 credentials validation failed:', error.message);
      return {
        success: false,
        message: 'Enhanced Jira OAuth2 credentials validation failed',
        error: error.message
      };
    }
  }

  // ===== HYBRID WORKFLOW FEATURES =====

  async getReleaseCandidates(args) {
    try {
      const { projectKey, sprintId } = args;
      
      if (!projectKey) {
        throw new Error('Project key is required');
      }

      logger.info(`Finding release candidates for project ${projectKey}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      // Get issues ready for release
      const jql = sprintId 
        ? `project = ${projectKey} AND sprint = ${sprintId} AND status = "Done" ORDER BY priority DESC`
        : `project = ${projectKey} AND status = "Done" AND fixVersion IS EMPTY ORDER BY priority DESC`;
      
      const searchResult = await this.searchIssues({ jql, maxResults: 100 });
      
      // Group by components for release planning
      const releaseCandidates = searchResult.issues.reduce((acc, issue) => {
        const component = issue.components?.[0] || 'General';
        if (!acc[component]) {
          acc[component] = [];
        }
        acc[component].push(issue);
        return acc;
      }, {});
      
      return {
        success: true,
        projectKey,
        sprintId,
        releaseCandidates,
        totalIssues: searchResult.total,
        message: `Found ${searchResult.total} release candidates for project ${projectKey}`
      };
    } catch (error) {
      logger.error('Failed to get release candidates:', error.message);
      throw error;
    }
  }

  async createReleaseVersion(args) {
    try {
      const { projectKey, version, description, releaseDate = null } = args;
      
      if (!projectKey || !version) {
        throw new Error('Project key and version are required');
      }

      logger.info(`Creating release version ${version} for project ${projectKey}`);
      
      // Update authentication before making request
      await this.updateClientAuth();
      
      const versionData = {
        name: version,
        description: description || `Release ${version}`,
        project: projectKey,
        released: false,
        archived: false
      };

      if (releaseDate) {
        versionData.releaseDate = releaseDate;
      }

      const response = await this.client.post('/rest/api/3/version', versionData);
      
      return {
        success: true,
        version: {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          projectKey: projectKey
        },
        message: `Created release version ${version} successfully`
      };
    } catch (error) {
      logger.error('Failed to create release version:', error.response?.data || error.message);
      throw new Error(`Failed to create release version: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'enhancedJira',
      description: 'Enhanced Jira integration with release workflow features and advanced capabilities',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: [
              // Release workflow features
              'getSprintStories', 'generateReleaseNotes', 'getActiveSprints',
              // Advanced Jira features
              'searchIssues', 'getIssueDetails', 'getProjects', 'getBoards',
              'createIssue', 'createDetailedIssue', 'updateIssue', 'transitionIssue', 'getDevInfo', 'generateStoryContent',
              // Hybrid workflow features
              'getReleaseCandidates', 'createReleaseVersion',
              // Utility
              'validateCredentials'
            ],
            description: 'The action to perform'
          },
          // Release workflow parameters
          sprintId: { type: 'string', description: 'Jira sprint ID' },
          version: { type: 'string', description: 'Version number for release notes' },
          boardId: { type: 'string', description: 'Jira board ID' },
          // Advanced Jira parameters
          jql: { type: 'string', description: 'JQL query for issue search' },
          maxResults: { type: 'number', description: 'Maximum number of results' },
          fields: { type: 'array', description: 'Fields to retrieve' },
          issueKey: { type: 'string', description: 'Jira issue key' },
          expand: { type: 'string', description: 'Fields to expand' },
          type: { type: 'string', description: 'Board type' },
          projectKey: { type: 'string', description: 'Jira project key' },
          summary: { type: 'string', description: 'Issue summary' },
          description: { type: 'string', description: 'Issue description' },
          issueType: { type: 'string', description: 'Issue type' },
          assignee: { type: 'string', description: 'Issue assignee' },
          transitionId: { type: 'string', description: 'Transition ID' },
          comment: { type: 'string', description: 'Comment text' },
          releaseDate: { type: 'string', description: 'Release date' }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      // Release workflow features
      case 'getSprintStories':
        return await this.getSprintStories(params);
      case 'generateReleaseNotes':
        return await this.generateReleaseNotes(params);
      case 'getActiveSprints':
        return await this.getActiveSprints(params);
      
      // Advanced Jira features
      case 'searchIssues':
        return await this.searchIssues(params);
      case 'getIssueDetails':
        return await this.getIssueDetails(params);
      case 'getProjects':
        return await this.getProjects(params);
      case 'getBoards':
        return await this.getBoards(params);
      case 'createIssue':
        return await this.createIssue(params);
      case 'createDetailedIssue':
        return await this.createDetailedIssue(params);
      case 'updateIssue':
        return await this.updateIssue(params);
      case 'transitionIssue':
        return await this.transitionIssue(params);
      case 'getDevInfo':
        return await this.getDevInfo(params);
      
      // Hybrid workflow features
      case 'getReleaseCandidates':
        return await this.getReleaseCandidates(params);
      case 'createReleaseVersion':
        return await this.createReleaseVersion(params);
      
      // Utility
      case 'validateCredentials':
        return await this.validateCredentials();
      case 'generateStoryContent':
        return await this.generateStoryContent(params);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async generateStoryContent(args) {
    try {
      const { title, issueType = 'Story', projectKey, epic = null, sprint = null, assignee = null, priority = 'Medium' } = args;
      
      if (!title) {
        throw new Error('Story title is required');
      }

      logger.info(`Generating story content for: ${title}`);

      // Generate comprehensive description using AI
      const descriptionPrompt = `Generate a detailed description for a ${issueType} titled "${title}" in project ${projectKey || 'PROJ'}.
      
Context:
- Issue Type: ${issueType}
- Project: ${projectKey || 'PROJ'}
- Epic: ${epic || 'None'}
- Sprint: ${sprint || 'None'}
- Assignee: ${assignee || 'Unassigned'}
- Priority: ${priority}

Please provide:
1. A comprehensive description explaining the feature/requirement
2. Business value and impact
3. Technical considerations
4. Dependencies and prerequisites
5. Success criteria

Format the response in markdown with clear sections.`;

      // Generate acceptance criteria using AI
      const acceptanceCriteriaPrompt = `Generate detailed acceptance criteria for a ${issueType} titled "${title}".
      
Context:
- Issue Type: ${issueType}
- Project: ${projectKey || 'PROJ'}
- Epic: ${epic || 'None'}
- Priority: ${priority}

Please provide:
1. Functional requirements (Given-When-Then format)
2. Non-functional requirements
3. Edge cases and error scenarios
4. Performance requirements
5. Security considerations
6. Testing requirements

Format as a numbered list with clear, testable criteria.`;

      // For now, we'll generate structured content based on the title and context
      // In a real implementation, this would call an AI service like OpenAI or GitHub Copilot API
      
      const description = this.generateStructuredDescription(title, issueType, projectKey, epic, sprint, assignee, priority);
      const acceptanceCriteria = this.generateAcceptanceCriteria(title, issueType, projectKey, epic, priority);

      return {
        success: true,
        content: {
          description,
          acceptanceCriteria,
          copilotSuggestions: this.generateCopilotSuggestions(title, issueType)
        },
        message: `Generated story content for "${title}"`
      };
    } catch (error) {
      logger.error('Failed to generate story content:', error.message);
      throw new Error(`Failed to generate story content: ${error.message}`);
    }
  }

  generateStructuredDescription(title, issueType, projectKey, epic, sprint, assignee, priority) {
    const project = projectKey || 'PROJ';
    
    return `## Overview
This ${issueType.toLowerCase()} implements ${title} to enhance the system's functionality and user experience.

## Business Value
- Improves user workflow efficiency
- Addresses specific business requirements
- Contributes to overall project goals
- Supports ${epic || 'project'} objectives

## Technical Requirements
- Implement ${title} following established patterns
- Ensure compatibility with existing systems
- Follow coding standards and best practices
- Include proper error handling and logging

## Dependencies
- Existing system infrastructure
- Related components and services
- Database schema updates (if required)
- Third-party integrations (if applicable)

## Success Criteria
- Feature is fully functional and tested
- Performance meets defined requirements
- Documentation is complete and accurate
- Code review is approved
- Integration tests pass successfully

## Additional Notes
- Priority: ${priority}
- Epic: ${epic || 'None'}
- Sprint: ${sprint || 'None'}
- Assignee: ${assignee || 'Unassigned'}`;
  }

  generateAcceptanceCriteria(title, issueType, projectKey, epic, priority) {
    return `## Functional Requirements

1. **Core Functionality**
   - Given a user accesses the system
   - When they interact with ${title}
   - Then the feature works as expected

2. **User Interface**
   - Given the user interface is loaded
   - When ${title} is displayed
   - Then all elements are properly rendered and functional

3. **Data Handling**
   - Given data is processed by ${title}
   - When operations are performed
   - Then data integrity is maintained

## Non-Functional Requirements

4. **Performance**
   - Response time is under 2 seconds
   - System handles expected load without degradation
   - Memory usage remains within acceptable limits

5. **Security**
   - All inputs are properly validated and sanitized
   - Authentication and authorization are enforced
   - Sensitive data is protected

6. **Compatibility**
   - Works across supported browsers and devices
   - Maintains backward compatibility
   - Integrates seamlessly with existing systems

## Edge Cases and Error Scenarios

7. **Error Handling**
   - System gracefully handles invalid inputs
   - Appropriate error messages are displayed
   - System recovers from failures

8. **Boundary Conditions**
   - Handles maximum/minimum data values
   - Manages concurrent user access
   - Processes large datasets efficiently

## Testing Requirements

9. **Test Coverage**
   - Unit tests cover all critical paths
   - Integration tests verify system interactions
   - End-to-end tests validate user workflows

10. **Quality Assurance**
    - Code review is completed
    - Performance testing is performed
    - Security testing is conducted`;
  }

  generateCopilotSuggestions(title, issueType) {
    return {
      vscodeCommands: [
        `// Generate description for: ${title}`,
        `// Type: ${issueType}`,
        `// Use GitHub Copilot to enhance this description`,
        `// Suggested prompt: "Write a detailed description for a ${issueType.toLowerCase()} about ${title}"`
      ],
      copilotPrompts: [
        `Write a comprehensive description for a ${issueType.toLowerCase()} titled "${title}" including business value, technical requirements, and success criteria.`,
        `Generate acceptance criteria for "${title}" in Given-When-Then format with functional and non-functional requirements.`,
        `Create test scenarios for "${title}" covering happy path, edge cases, and error conditions.`,
        `Write technical implementation notes for "${title}" including architecture considerations and best practices.`
      ],
      vscodeIntegration: {
        description: `To use GitHub Copilot in VS Code for this story:
1. Open the story in Jira
2. Click "Edit" on the description field
3. Use Ctrl+Shift+I (Cmd+Shift+I on Mac) to trigger Copilot
4. Type: "Write a detailed description for ${title}"
5. Press Tab to accept Copilot suggestions`,
        acceptanceCriteria: `To generate acceptance criteria with Copilot:
1. In the acceptance criteria field
2. Use Ctrl+Shift+I to trigger Copilot
3. Type: "Generate acceptance criteria for ${title} in Given-When-Then format"
4. Press Tab to accept suggestions
5. Review and refine the generated criteria`
      }
    };
  }
}

module.exports = EnhancedJiraTool;

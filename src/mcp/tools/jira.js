const { Tool } = require('@modelcontextprotocol/sdk');
const axios = require('axios');
const { logger } = require('../../utils/logger');

class JiraTool extends Tool {
  constructor() {
    super({
      name: 'jira',
      description: 'Manage Jira sprints, stories, and generate release notes',
      version: '1.0.0'
    });

    this.host = process.env.JIRA_HOST;
    this.email = process.env.JIRA_EMAIL;
    this.apiToken = process.env.JIRA_API_TOKEN;
    
    this.client = axios.create({
      baseURL: this.host,
      auth: {
        username: this.email,
        password: this.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async getSprintStories(args) {
    try {
      const { sprintId } = args;
      
      if (!sprintId) {
        throw new Error('Sprint ID is required');
      }

      logger.info(`Fetching stories for sprint: ${sprintId}`);
      
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
          'updated'
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
        updated: issue.fields.updated
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
        });
        releaseNotes += '\n';
      }
      
      if (improvements.length > 0) {
        releaseNotes += `## 🔧 Improvements\n\n`;
        improvements.forEach(story => {
          releaseNotes += `- **${story.key}:** ${story.summary}\n`;
        });
        releaseNotes += '\n';
      }
      
      if (bugs.length > 0) {
        releaseNotes += `## 🐛 Bug Fixes\n\n`;
        bugs.forEach(story => {
          releaseNotes += `- **${story.key}:** ${story.summary}\n`;
        });
        releaseNotes += '\n';
      }
      
      releaseNotes += `## 📊 Summary\n\n`;
      releaseNotes += `- Total Stories: ${stories.length}\n`;
      releaseNotes += `- Features: ${features.length}\n`;
      releaseNotes += `- Improvements: ${improvements.length}\n`;
      releaseNotes += `- Bug Fixes: ${bugs.length}\n`;
      
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

  async getSprintInfo(args) {
    try {
      const { sprintId } = args;
      
      if (!sprintId) {
        throw new Error('Sprint ID is required');
      }

      const response = await this.client.get(`/rest/agile/1.0/sprint/${sprintId}`);
      
      return {
        success: true,
        sprint: response.data,
        message: `Sprint information retrieved for ${sprintId}`
      };
    } catch (error) {
      logger.error('Failed to get sprint info:', error.response?.data || error.message);
      throw new Error(`Failed to get sprint info: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getActiveSprints(args) {
    try {
      const { boardId } = args;
      
      if (!boardId) {
        throw new Error('Board ID is required');
      }

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

  async validateCredentials() {
    try {
      await this.client.get('/rest/api/3/myself');
      return {
        success: true,
        message: 'Jira credentials are valid'
      };
    } catch (error) {
      logger.error('Jira credentials validation failed:', error.message);
      return {
        success: false,
        message: 'Jira credentials validation failed',
        error: error.message
      };
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'jira',
      description: 'Manage Jira sprints, stories, and generate release notes',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['getSprintStories', 'generateReleaseNotes', 'getSprintInfo', 'getActiveSprints', 'validateCredentials'],
            description: 'The action to perform'
          },
          sprintId: {
            type: 'string',
            description: 'Jira sprint ID'
          },
          version: {
            type: 'string',
            description: 'Version number for release notes'
          },
          boardId: {
            type: 'string',
            description: 'Jira board ID'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'getSprintStories':
        return await this.getSprintStories(params);
      case 'generateReleaseNotes':
        return await this.generateReleaseNotes(params);
      case 'getSprintInfo':
        return await this.getSprintInfo(params);
      case 'getActiveSprints':
        return await this.getActiveSprints(params);
      case 'validateCredentials':
        return await this.validateCredentials();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = JiraTool;

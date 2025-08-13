const axios = require('axios');
const { logger } = require('../utils/logger');

class JiraService {
  constructor() {
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

  async getSprintStories(sprintId) {
    try {
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
      
      return issues.map(issue => ({
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
    } catch (error) {
      logger.error('Failed to fetch sprint stories:', error.response?.data || error.message);
      throw new Error(`Failed to fetch sprint stories: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async generateReleaseNotes(sprintId, version) {
    try {
      logger.info(`Generating release notes for version ${version} from sprint ${sprintId}`);
      
      const stories = await this.getSprintStories(sprintId);
      
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
        }
      };
    } catch (error) {
      logger.error('Failed to generate release notes:', error.message);
      throw error;
    }
  }

  async getSprintInfo(sprintId) {
    try {
      const response = await this.client.get(`/rest/agile/1.0/sprint/${sprintId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get sprint info:', error.response?.data || error.message);
      throw new Error(`Failed to get sprint info: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getActiveSprints(boardId) {
    try {
      const response = await this.client.get(`/rest/agile/1.0/board/${boardId}/sprint`, {
        params: {
          state: 'active'
        }
      });
      return response.data.values || [];
    } catch (error) {
      logger.error('Failed to get active sprints:', error.response?.data || error.message);
      throw new Error(`Failed to get active sprints: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async validateCredentials() {
    try {
      await this.client.get('/rest/api/3/myself');
      return true;
    } catch (error) {
      logger.error('Jira credentials validation failed:', error.message);
      return false;
    }
  }
}

module.exports = new JiraService();

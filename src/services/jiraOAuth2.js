const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
const { logger } = require('../utils/logger');
const { getUserName, getHomeDir } = require('../utils/userUtils');

class JiraOAuth2Service {
  constructor() {
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

  async getSprintStories(sprintId) {
    try {
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
        updated: issue.fields.updated,
        epic: issue.fields.customfield_31603?.value || null,
        sprint: issue.fields.customfield_10004?.name || null,
        approver: issue.fields.customfield_10545?.displayName || null,
        reporterTeam: issue.fields.customfield_10300?.value || null
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
        }
      };
    } catch (error) {
      logger.error('Failed to generate release notes:', error.message);
      throw error;
    }
  }

  async getSprintInfo(sprintId) {
    try {
      // Update authentication before making request
      await this.updateClientAuth();
      
      const response = await this.client.get(`/rest/agile/1.0/sprint/${sprintId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get sprint info:', error.response?.data || error.message);
      throw new Error(`Failed to get sprint info: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }
  }

  async getActiveSprints(boardId) {
    try {
      // Update authentication before making request
      await this.updateClientAuth();
      
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

  async getProjects() {
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

  async validateCredentials() {
    try {
      // Update authentication before making request
      await this.updateClientAuth();
      
      await this.client.get('/rest/api/3/myself');
      return {
        success: true,
        message: 'Jira OAuth2 credentials are valid'
      };
    } catch (error) {
      logger.error('Jira OAuth2 credentials validation failed:', error.message);
      return {
        success: false,
        message: 'Jira OAuth2 credentials validation failed',
        error: error.message
      };
    }
  }
}

module.exports = new JiraOAuth2Service();

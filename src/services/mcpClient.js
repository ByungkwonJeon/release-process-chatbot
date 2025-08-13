const { Client } = require('@modelcontextprotocol/sdk');
const { logger } = require('../utils/logger');

class MCPClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.tools = {};
  }

  async connect(serverUrl = 'ws://localhost:3002') {
    try {
      logger.info(`Connecting to MCP server at ${serverUrl}`);
      
      this.client = new Client({
        serverUrl,
        name: 'release-chatbot-client',
        version: '1.0.0'
      });

      await this.client.connect();
      this.connected = true;
      
      // Discover available tools
      await this.discoverTools();
      
      logger.info('Successfully connected to MCP server');
      return true;
    } catch (error) {
      logger.error('Failed to connect to MCP server:', error.message);
      this.connected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.connected) {
      try {
        await this.client.disconnect();
        this.connected = false;
        logger.info('Disconnected from MCP server');
      } catch (error) {
        logger.error('Error disconnecting from MCP server:', error.message);
      }
    }
  }

  async discoverTools() {
    try {
      if (!this.connected) {
        throw new Error('Not connected to MCP server');
      }

      const tools = await this.client.listTools();
      this.tools = tools.reduce((acc, tool) => {
        acc[tool.name] = tool;
        return acc;
      }, {});

      logger.info(`Discovered ${Object.keys(this.tools).length} MCP tools: ${Object.keys(this.tools).join(', ')}`);
      return this.tools;
    } catch (error) {
      logger.error('Failed to discover MCP tools:', error.message);
      throw error;
    }
  }

  async callTool(toolName, action, params = {}) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to MCP server');
      }

      if (!this.tools[toolName]) {
        throw new Error(`Tool ${toolName} not found. Available tools: ${Object.keys(this.tools).join(', ')}`);
      }

      logger.info(`Calling MCP tool ${toolName} with action ${action}`);
      
      const result = await this.client.callTool(toolName, {
        action,
        ...params
      });

      logger.info(`MCP tool ${toolName} call completed successfully`);
      return result;
    } catch (error) {
      logger.error(`Failed to call MCP tool ${toolName}:`, error.message);
      throw error;
    }
  }

  // Convenience methods for each tool
  async bitbucket(action, params = {}) {
    return await this.callTool('bitbucket', action, params);
  }

  async jira(action, params = {}) {
    return await this.callTool('jira', action, params);
  }

  async enhancedJira(action, params = {}) {
    return await this.callTool('enhancedJira', action, params);
  }

  async terraform(action, params = {}) {
    return await this.callTool('terraform', action, params);
  }

  async spinnaker(action, params = {}) {
    return await this.callTool('spinnaker', action, params);
  }

  async aws(action, params = {}) {
    return await this.callTool('aws', action, params);
  }

  async release(action, params = {}) {
    return await this.callTool('release', action, params);
  }

  // High-level workflow methods
  async createReleaseBranch(version, sourceBranch = 'main') {
    return await this.bitbucket('createReleaseBranch', {
      version,
      sourceBranch
    });
  }

  async generateReleaseNotes(sprintId, version) {
    return await this.enhancedJira('generateReleaseNotes', {
      sprintId,
      version
    });
  }

  async buildInfrastructure(environment = 'staging') {
    return await this.terraform('buildInfrastructure', {
      environment
    });
  }

  async deployApplication(applicationName, environment, version, artifacts = []) {
    return await this.spinnaker('deployApplication', {
      applicationName,
      environment,
      version,
      artifacts
    });
  }

  async verifyDeployment(environment, applications) {
    return await this.aws('verifyDeployment', {
      environment,
      applications
    });
  }

  async createRelease(version, environment, applications, sprintId = null) {
    return await this.release('createRelease', {
      version,
      environment,
      applications,
      sprintId
    });
  }

  async getReleaseStatus(releaseId) {
    return await this.release('getReleaseStatus', {
      releaseId
    });
  }

  async updateStepStatus(releaseId, stepType, status, output = null, errorMessage = null) {
    return await this.release('updateStepStatus', {
      releaseId,
      stepType,
      status,
      output,
      errorMessage
    });
  }

  async addReleaseLog(releaseId, level, message, stepId = null, source = null) {
    return await this.release('addReleaseLog', {
      releaseId,
      level,
      message,
      stepId,
      source
    });
  }

  async getReleaseLogs(releaseId, stepId = null, level = null, limit = 100) {
    return await this.release('getReleaseLogs', {
      releaseId,
      stepId,
      level,
      limit
    });
  }

  async completeRelease(releaseId, status = 'completed') {
    return await this.release('completeRelease', {
      releaseId,
      status
    });
  }

  // ===== ENHANCED JIRA WORKFLOW METHODS =====

  async getReleaseCandidates(projectKey, sprintId = null) {
    return await this.enhancedJira('getReleaseCandidates', {
      projectKey,
      sprintId
    });
  }

  async createReleaseVersion(projectKey, version, description = null, releaseDate = null) {
    return await this.enhancedJira('createReleaseVersion', {
      projectKey,
      version,
      description,
      releaseDate
    });
  }

  async searchIssues(jql, maxResults = 50) {
    return await this.enhancedJira('searchIssues', {
      jql,
      maxResults
    });
  }

  async getIssueDetails(issueKey, expand = 'changelog,comments') {
    return await this.enhancedJira('getIssueDetails', {
      issueKey,
      expand
    });
  }

  async getDevInfo(issueKey) {
    return await this.enhancedJira('getDevInfo', {
      issueKey
    });
  }

  async createIssue(projectKey, summary, description = null, issueType = 'Task', assignee = null) {
    return await this.enhancedJira('createIssue', {
      projectKey,
      summary,
      description,
      issueType,
      assignee
    });
  }

  async transitionIssue(issueKey, transitionId, comment = null) {
    return await this.enhancedJira('transitionIssue', {
      issueKey,
      transitionId,
      comment
    });
  }

  async getProjects() {
    return await this.enhancedJira('getProjects');
  }

  async getBoards(type = 'scrum') {
    return await this.enhancedJira('getBoards', {
      type
    });
  }

  // Health check methods
  async validateAllCredentials() {
    const results = {};
    
    try {
      results.bitbucket = await this.bitbucket('validateCredentials');
    } catch (error) {
      results.bitbucket = { success: false, error: error.message };
    }

    try {
      results.jira = await this.jira('validateCredentials');
    } catch (error) {
      results.jira = { success: false, error: error.message };
    }

    try {
      results.terraform = await this.terraform('testConnection');
    } catch (error) {
      results.terraform = { success: false, error: error.message };
    }

    try {
      results.spinnaker = await this.spinnaker('validateCredentials');
    } catch (error) {
      results.spinnaker = { success: false, error: error.message };
    }

    try {
      results.aws = await this.aws('validateCredentials');
    } catch (error) {
      results.aws = { success: false, error: error.message };
    }

    return results;
  }

  isConnected() {
    return this.connected;
  }

  getAvailableTools() {
    return Object.keys(this.tools);
  }

  getToolInfo(toolName) {
    return this.tools[toolName];
  }
}

// Create and export singleton instance
const mcpClient = new MCPClient();

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Shutting down MCP client...');
  await mcpClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down MCP client...');
  await mcpClient.disconnect();
  process.exit(0);
});

module.exports = mcpClient;

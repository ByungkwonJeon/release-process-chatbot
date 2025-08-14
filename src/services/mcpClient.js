const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio');
const { spawn } = require('child_process');
const { logger } = require('../utils/logger');

class MCPClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.serverProcess = null;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return true;
      }

      logger.info('Starting MCP server process...');
      
      // Start the MCP server as a child process
      this.serverProcess = spawn('node', ['src/mcp/server.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Create transport for the server process
      const transport = new StdioClientTransport(
        this.serverProcess.stdin,
        this.serverProcess.stdout
      );

      // Create MCP client
      this.client = new Client({
        name: 'release-process-chatbot-client',
        version: '1.0.0'
      });

      // Connect to the server
      await this.client.connect(transport);
      
      this.isConnected = true;
      logger.info('MCP client connected successfully');
      
      return true;
    } catch (error) {
      logger.error('Failed to connect MCP client:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
      
      if (this.serverProcess) {
        this.serverProcess.kill();
        this.serverProcess = null;
      }
      
      this.isConnected = false;
      logger.info('MCP client disconnected');
    } catch (error) {
      logger.error('Error disconnecting MCP client:', error.message);
    }
  }

  async callTool(name, args = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      logger.info(`Calling MCP tool: ${name} with args:`, args);
      
      const result = await this.client.callTool({
        name,
        arguments: args
      });

      logger.info(`MCP tool ${name} executed successfully`);
      return result;
    } catch (error) {
      logger.error(`Failed to call MCP tool ${name}:`, error.message);
      throw error;
    }
  }

  // Jira-specific methods
  async getSprintStories(sprintId) {
    const result = await this.callTool('getSprintStories', { sprintId });
    return JSON.parse(result.content[0].text);
  }

  async getActiveSprints(boardId = null) {
    const result = await this.callTool('getActiveSprints', { boardId });
    return JSON.parse(result.content[0].text);
  }

  async generateReleaseNotes(sprintId, version) {
    const result = await this.callTool('generateReleaseNotes', { sprintId, version });
    return JSON.parse(result.content[0].text);
  }

  async getSprintInfo(sprintId) {
    const result = await this.callTool('getSprintInfo', { sprintId });
    return JSON.parse(result.content[0].text);
  }

  async getProjects() {
    const result = await this.callTool('getProjects', {});
    return JSON.parse(result.content[0].text);
  }

  // Enhanced Jira method for backward compatibility
  async enhancedJira(action, params = {}) {
    switch (action) {
      case 'getSprintStories':
        return await this.getSprintStories(params.sprintId);
        
      case 'getActiveSprints':
        return await this.getActiveSprints(params.boardId);
        
      case 'generateReleaseNotes':
        return await this.generateReleaseNotes(params.sprintId, params.version);
        
      case 'getSprintInfo':
        return await this.getSprintInfo(params.sprintId);
        
      case 'getProjects':
        return await this.getProjects();
        
      default:
        throw new Error(`Unknown Jira action: ${action}`);
    }
  }
}

// Create and export singleton instance
const mcpClient = new MCPClient();

// Handle graceful shutdown
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

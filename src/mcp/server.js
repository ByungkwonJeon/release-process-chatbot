const { Server } = require('@modelcontextprotocol/sdk');
const { logger } = require('../utils/logger');

// Import MCP tools
const BitbucketTool = require('./tools/bitbucket');
const JiraTool = require('./tools/jira');
const EnhancedJiraTool = require('./tools/enhancedJira');
const TerraformTool = require('./tools/terraform');
const SpinnakerTool = require('./tools/spinnaker');
const AWSTool = require('./tools/aws');
const ReleaseTool = require('./tools/release');

class MCPServer {
  constructor() {
    this.server = new Server({
      name: 'release-process-chatbot',
      version: '1.0.0'
    });

    this.tools = {
      bitbucket: new BitbucketTool(),
      jira: new JiraTool(),
      enhancedJira: new EnhancedJiraTool(),
      terraform: new TerraformTool(),
      spinnaker: new SpinnakerTool(),
      aws: new AWSTool(),
      release: new ReleaseTool()
    };

    this.setupTools();
  }

  setupTools() {
    // Register all tools with the MCP server
    Object.values(this.tools).forEach(tool => {
      this.server.addTool(tool);
    });

    logger.info('MCP tools registered successfully');
  }

  async start(port = 3002) {
    try {
      await this.server.listen(port);
      logger.info(`MCP server started on port ${port}`);
      
      // Log available tools
      const toolNames = Object.keys(this.tools);
      logger.info(`Available MCP tools: ${toolNames.join(', ')}`);
      
      return this.server;
    } catch (error) {
      logger.error('Failed to start MCP server:', error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.server.close();
      logger.info('MCP server stopped');
    } catch (error) {
      logger.error('Error stopping MCP server:', error);
    }
  }

  getTool(name) {
    return this.tools[name];
  }

  getAllTools() {
    return this.tools;
  }
}

// Create and export singleton instance
const mcpServer = new MCPServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down MCP server...');
  await mcpServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down MCP server...');
  await mcpServer.stop();
  process.exit(0);
});

module.exports = mcpServer;

// Start server if run directly
if (require.main === module) {
  const port = process.env.MCP_PORT || 3002;
  mcpServer.start(port).catch(error => {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

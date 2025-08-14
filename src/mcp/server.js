const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
const { logger } = require('../utils/logger');

// Import our OAuth2 Jira service
const jiraOAuth2Service = require('../services/jiraOAuth2');

// Create MCP server
const server = new Server({
  name: 'release-process-chatbot',
  version: '1.0.0'
});

// Register tool request handlers
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'getSprintStories',
        description: 'Get all stories from a Jira sprint',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'The sprint ID'
            }
          },
          required: ['sprintId']
        }
      },
      {
        name: 'getActiveSprints',
        description: 'Get all active sprints from a Jira board',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: {
              type: 'string',
              description: 'The board ID (optional)'
            }
          }
        }
      },
      {
        name: 'generateReleaseNotes',
        description: 'Generate release notes from a sprint',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'The sprint ID'
            },
            version: {
              type: 'string',
              description: 'The version number'
            }
          },
          required: ['sprintId', 'version']
        }
      },
      {
        name: 'getSprintInfo',
        description: 'Get information about a specific sprint',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: {
              type: 'string',
              description: 'The sprint ID'
            }
          },
          required: ['sprintId']
        }
      },
      {
        name: 'getProjects',
        description: 'Get all Jira projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    logger.info(`MCP Tool called: ${name} with args:`, args);

    switch (name) {
  async listTools() {
    return {
      tools: [
        {
          name: 'getSprintStories',
          description: 'Get all stories from a Jira sprint',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'The sprint ID'
              }
            },
            required: ['sprintId']
          }
        },
        {
          name: 'getActiveSprints',
          description: 'Get all active sprints from a Jira board',
          inputSchema: {
            type: 'object',
            properties: {
              boardId: {
                type: 'string',
                description: 'The board ID (optional)'
              }
            }
          }
        },
        {
          name: 'generateReleaseNotes',
          description: 'Generate release notes from a sprint',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'The sprint ID'
              },
              version: {
                type: 'string',
                description: 'The version number'
              }
            },
            required: ['sprintId', 'version']
          }
        },
        {
          name: 'getSprintInfo',
          description: 'Get information about a specific sprint',
          inputSchema: {
            type: 'object',
            properties: {
              sprintId: {
                type: 'string',
                description: 'The sprint ID'
              }
            },
            required: ['sprintId']
          }
        },
        {
          name: 'getProjects',
          description: 'Get all Jira projects',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        }
      ]
    };
  },

  async callTool({ name, arguments: args }) {
    try {
      logger.info(`MCP Tool called: ${name} with args:`, args);

      switch (name) {
        case 'getSprintStories':
          const stories = await jiraOAuth2Service.getSprintStories(args.sprintId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(stories, null, 2)
              }
            ]
          };

        case 'getActiveSprints':
          const sprints = await jiraOAuth2Service.getActiveSprints(args.boardId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(sprints, null, 2)
              }
            ]
          };

        case 'generateReleaseNotes':
          const releaseNotes = await jiraOAuth2Service.generateReleaseNotes(args.sprintId, args.version);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(releaseNotes, null, 2)
              }
            ]
          };

        case 'getSprintInfo':
          const sprintInfo = await jiraOAuth2Service.getSprintInfo(args.sprintId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(sprintInfo, null, 2)
              }
            ]
          };

        case 'getProjects':
          const projects = await jiraOAuth2Service.getProjects();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(projects, null, 2)
              }
            ]
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`MCP Tool error for ${name}:`, error.message);
      throw error;
    }
  }
});

// Start the server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('MCP Server started successfully');
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

startServer();

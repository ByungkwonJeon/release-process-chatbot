const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { initializeDatabase } = require('./models/database');
const chatRoutes = require('./routes/chat');
const releaseRoutes = require('./routes/releases');
const { setupSocketHandlers } = require('./utils/socketHandlers');
// Jira OAuth2 integration
const jiraOAuth2Service = require('./services/jiraOAuth2');

let mcpClient = {
  connect: async () => {
    logger.info('Jira OAuth2 service connected');
    return true;
  },
  isConnected: () => true,
  enhancedJira: async (action, params) => {
    logger.info(`Jira OAuth2 service called with action: ${action}`);
    
    try {
      switch (action) {
        case 'getSprintStories':
          return await jiraOAuth2Service.getSprintStories(params.sprintId);
          
        case 'getActiveSprints':
          return await jiraOAuth2Service.getActiveSprints(params.boardId);
          
        case 'generateReleaseNotes':
          return await jiraOAuth2Service.generateReleaseNotes(params.sprintId, params.version);
          
        case 'getSprintInfo':
          return await jiraOAuth2Service.getSprintInfo(params.sprintId);
          
        case 'getProjects':
          return await jiraOAuth2Service.getProjects();
          
        default:
          logger.warn(`Unknown Jira action: ${action}`);
          return { error: `Unknown action: ${action}` };
      }
    } catch (error) {
      logger.error(`Jira OAuth2 service error for action ${action}:`, error.message);
      throw error;
    }
  }
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/releases', releaseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');
    
    // Connect to MCP server
    if (mcpClient) {
      try {
        await mcpClient.connect(process.env.MCP_SERVER_URL || 'ws://localhost:3002');
        logger.info('MCP client connected successfully');
      } catch (error) {
        logger.warn('Failed to connect to MCP server, continuing without MCP integration:', error.message);
      }
    } else {
      logger.info('MCP client not available, skipping MCP integration');
    }
    
    // Setup Socket.IO handlers
    setupSocketHandlers(io);
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`MCP Integration: ${mcpClient && mcpClient.isConnected() ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

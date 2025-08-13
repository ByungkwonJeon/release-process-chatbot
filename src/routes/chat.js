const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const chatbotLogic = require('../utils/chatbotLogic');

const router = express.Router();

// Generate session ID for new users
router.post('/session', (req, res) => {
  try {
    const sessionId = uuidv4();
    logger.info(`Generated new session ID: ${sessionId}`);
    
    res.json({
      success: true,
      sessionId,
      message: 'Session created successfully'
    });
  } catch (error) {
    logger.error('Failed to create session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// Send message to chatbot
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Message and sessionId are required'
      });
    }

    logger.info(`Received message from session ${sessionId}: ${message}`);

    // Process the message
    const result = await chatbotLogic.processMessage(message, sessionId);

    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        conversationId: result.conversationId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        response: result.response
      });
    }
  } catch (error) {
    logger.error('Failed to process message:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      message: error.message
    });
  }
});

// Get conversation history
router.get('/conversation/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { Conversation, Release } = require('../models/database');

    const conversation = await Conversation.findOne({
      where: { sessionId },
      include: [
        {
          model: Release,
          as: 'releases',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        startedAt: conversation.startedAt,
        lastActivityAt: conversation.lastActivityAt,
        releases: conversation.releases.map(release => ({
          id: release.id,
          version: release.version,
          environment: release.environment,
          status: release.status,
          startedAt: release.startedAt,
          completedAt: release.completedAt
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get conversation:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation'
    });
  }
});

// Get available commands
router.get('/commands', (req, res) => {
  try {
    const commands = [
      {
        command: 'Start a new release for version X.X.X',
        description: 'Start a complete release process',
        example: 'Start a new release for version 2.1.0'
      },
      {
        command: 'What\'s the status?',
        description: 'Check the current release status',
        example: 'What\'s the status of the current release?'
      },
      {
        command: 'Show me the logs',
        description: 'View recent release logs',
        example: 'Show me the logs for infrastructure build'
      },
      {
        command: 'Deploy services to environment',
        description: 'Deploy specific services to target environment',
        example: 'Deploy backend services to staging'
      },
      {
        command: 'Execute step',
        description: 'Execute a specific release step',
        example: 'Execute branch creation'
      },
      {
        command: 'Help',
        description: 'Show available commands',
        example: 'Help'
      }
    ];

    res.json({
      success: true,
      commands
    });
  } catch (error) {
    logger.error('Failed to get commands:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get commands'
    });
  }
});

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'chat',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

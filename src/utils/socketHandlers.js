const { logger } = require('./logger');
const chatbotLogic = require('./chatbotLogic');
const { Conversation } = require('../models/database');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { message, sessionId } = data;

        if (!message || !sessionId) {
          socket.emit('error', {
            message: 'Message and sessionId are required'
          });
          return;
        }

        logger.info(`Received chat message from ${socket.id}: ${message}`);

        // Process the message
        const result = await chatbotLogic.processMessage(message, sessionId);

        if (result.success) {
          // Send response back to the client
          socket.emit('chat_response', {
            success: true,
            response: result.response,
            conversationId: result.conversationId,
            timestamp: new Date().toISOString()
          });

          // Broadcast to other clients in the same session (if needed)
          socket.broadcast.to(sessionId).emit('chat_response', {
            success: true,
            response: result.response,
            conversationId: result.conversationId,
            timestamp: new Date().toISOString()
          });
        } else {
          socket.emit('error', {
            message: result.error || 'Failed to process message'
          });
        }
      } catch (error) {
        logger.error('Error handling chat message:', error.message);
        socket.emit('error', {
          message: 'Internal server error'
        });
      }
    });

    // Handle session creation
    socket.on('create_session', async () => {
      try {
        const sessionId = require('uuid').v4();
        logger.info(`Created new session: ${sessionId} for client: ${socket.id}`);

        // Join the session room
        socket.join(sessionId);

        socket.emit('session_created', {
          success: true,
          sessionId,
          message: 'Session created successfully'
        });
      } catch (error) {
        logger.error('Error creating session:', error.message);
        socket.emit('error', {
          message: 'Failed to create session'
        });
      }
    });

    // Handle joining existing session
    socket.on('join_session', async (data) => {
      try {
        const { sessionId } = data;

        if (!sessionId) {
          socket.emit('error', {
            message: 'SessionId is required'
          });
          return;
        }

        // Check if session exists
        const conversation = await Conversation.findOne({
          where: { sessionId, isActive: true }
        });

        if (!conversation) {
          socket.emit('error', {
            message: 'Session not found or inactive'
          });
          return;
        }

        // Join the session room
        socket.join(sessionId);

        socket.emit('session_joined', {
          success: true,
          sessionId,
          conversationId: conversation.id,
          message: 'Joined session successfully'
        });

        logger.info(`Client ${socket.id} joined session: ${sessionId}`);
      } catch (error) {
        logger.error('Error joining session:', error.message);
        socket.emit('error', {
          message: 'Failed to join session'
        });
      }
    });

    // Handle release status updates
    socket.on('subscribe_release_status', async (data) => {
      try {
        const { releaseId } = data;

        if (!releaseId) {
          socket.emit('error', {
            message: 'ReleaseId is required'
          });
          return;
        }

        // Join the release room
        socket.join(`release_${releaseId}`);

        socket.emit('release_status_subscribed', {
          success: true,
          releaseId,
          message: 'Subscribed to release status updates'
        });

        logger.info(`Client ${socket.id} subscribed to release status: ${releaseId}`);
      } catch (error) {
        logger.error('Error subscribing to release status:', error.message);
        socket.emit('error', {
          message: 'Failed to subscribe to release status'
        });
      }
    });

    // Handle release logs subscription
    socket.on('subscribe_release_logs', async (data) => {
      try {
        const { releaseId } = data;

        if (!releaseId) {
          socket.emit('error', {
            message: 'ReleaseId is required'
          });
          return;
        }

        // Join the release logs room
        socket.join(`release_logs_${releaseId}`);

        socket.emit('release_logs_subscribed', {
          success: true,
          releaseId,
          message: 'Subscribed to release logs'
        });

        logger.info(`Client ${socket.id} subscribed to release logs: ${releaseId}`);
      } catch (error) {
        logger.error('Error subscribing to release logs:', error.message);
        socket.emit('error', {
          message: 'Failed to subscribe to release logs'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { sessionId } = data;
      if (sessionId) {
        socket.broadcast.to(sessionId).emit('user_typing', {
          userId: socket.id,
          typing: true
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { sessionId } = data;
      if (sessionId) {
        socket.broadcast.to(sessionId).emit('user_typing', {
          userId: socket.id,
          typing: false
        });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Function to broadcast release status updates
  io.broadcastReleaseStatus = (releaseId, status) => {
    io.to(`release_${releaseId}`).emit('release_status_update', {
      releaseId,
      status,
      timestamp: new Date().toISOString()
    });
  };

  // Function to broadcast release log updates
  io.broadcastReleaseLog = (releaseId, log) => {
    io.to(`release_logs_${releaseId}`).emit('release_log_update', {
      releaseId,
      log,
      timestamp: new Date().toISOString()
    });
  };

  // Function to broadcast step progress updates
  io.broadcastStepProgress = (releaseId, stepType, progress) => {
    io.to(`release_${releaseId}`).emit('step_progress_update', {
      releaseId,
      stepType,
      progress,
      timestamp: new Date().toISOString()
    });
  };

  // Function to broadcast error notifications
  io.broadcastError = (releaseId, error) => {
    io.to(`release_${releaseId}`).emit('release_error', {
      releaseId,
      error,
      timestamp: new Date().toISOString()
    });
  };

  // Function to broadcast completion notifications
  io.broadcastCompletion = (releaseId, result) => {
    io.to(`release_${releaseId}`).emit('release_completed', {
      releaseId,
      result,
      timestamp: new Date().toISOString()
    });
  };

  logger.info('Socket.IO handlers configured successfully');
}

module.exports = { setupSocketHandlers };

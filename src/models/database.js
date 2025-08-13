const fileDatabase = require('./fileDatabase');
const { logger } = require('../utils/logger');

// For backward compatibility, we'll create a Sequelize-like interface
// that uses the file database underneath

// Mock Sequelize models for backward compatibility
const Release = {
  create: (data) => fileDatabase.createRelease(data),
  findByPk: (id) => fileDatabase.findReleaseById(id),
  findOne: (options) => {
    if (options.where && options.where.version) {
      return fileDatabase.findReleaseByVersion(options.where.version);
    }
    return null;
  },
  findAll: (options) => {
    if (options && options.where && options.where.status) {
      return fileDatabase.findReleasesByStatus(options.where.status);
    }
    return fileDatabase.findAllReleases();
  },
  update: (data, options) => {
    if (options && options.where && options.where.id) {
      return fileDatabase.updateRelease(options.where.id, data);
    }
    throw new Error('Update requires where clause with id');
  },
  destroy: (options) => {
    if (options && options.where && options.where.id) {
      return fileDatabase.deleteRelease(options.where.id);
    }
    throw new Error('Delete requires where clause with id');
  }
};

const Conversation = {
  create: (data) => fileDatabase.createConversation(data),
  findByPk: (id) => fileDatabase.findConversationById(id),
  findOne: (options) => {
    if (options && options.where && options.where.sessionId) {
      return fileDatabase.findConversationBySessionId(options.where.sessionId);
    }
    return null;
  },
  findAll: () => fileDatabase.findAllConversations(),
  update: (data, options) => {
    if (options && options.where && options.where.id) {
      return fileDatabase.updateConversation(options.where.id, data);
    }
    throw new Error('Update requires where clause with id');
  }
};

const ReleaseStep = {
  create: (data) => fileDatabase.createReleaseStep(data),
  findAll: (options) => {
    if (options && options.where && options.where.releaseId) {
      return fileDatabase.findReleaseStepsByReleaseId(options.where.releaseId);
    }
    return [];
  },
  update: (data, options) => {
    if (options && options.where && options.where.id) {
      return fileDatabase.updateReleaseStep(options.where.id, data);
    }
    throw new Error('Update requires where clause with id');
  }
};

const ReleaseLog = {
  create: (data) => fileDatabase.createReleaseLog(data),
  findAll: (options) => {
    if (options && options.where && options.where.releaseId) {
      return fileDatabase.findReleaseLogsByReleaseId(options.where.releaseId);
    }
    if (options && options.where && options.where.stepId) {
      return fileDatabase.findReleaseLogsByStepId(options.where.stepId);
    }
    return [];
  }
};

// Mock sequelize object for backward compatibility
const sequelize = {
  authenticate: async () => {
    logger.info('File database connection established successfully');
    return true;
  },
  sync: async (options) => {
    logger.info('File database models synchronized');
    return true;
  }
};

// Initialize database
async function initializeDatabase() {
  try {
    await fileDatabase.initialize();
    logger.info('File database initialized successfully');
    return sequelize;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
  Release,
  Conversation,
  ReleaseStep,
  ReleaseLog,
  fileDatabase // Export the actual file database for direct access
};

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { logger } = require('../utils/logger');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../release_chatbot.db'),
  logging: (msg) => logger.debug(msg),
  define: {
    timestamps: true,
    underscored: true
  }
});

// Define models directly to avoid circular dependencies
const Release = sequelize.define('Release', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  environment: {
    type: DataTypes.ENUM('development', 'staging', 'production'),
    defaultValue: 'staging'
  },
  applications: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  releaseBranch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  releaseNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'releases',
  indexes: [
    { fields: ['version'] },
    { fields: ['status'] },
    { fields: ['environment'] }
  ]
});

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'conversations',
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['isActive'] }
  ]
});

const ReleaseStep = sequelize.define('ReleaseStep', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  releaseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  stepType: {
    type: DataTypes.ENUM(
      'create_release_branch',
      'generate_release_notes',
      'build_infrastructure',
      'build_services',
      'deploy_services',
      'verify_deployment'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'skipped'),
    defaultValue: 'pending'
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  result: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'release_steps',
  indexes: [
    { fields: ['releaseId'] },
    { fields: ['stepType'] },
    { fields: ['status'] }
  ]
});

const ReleaseLog = sequelize.define('ReleaseLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  releaseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  level: {
    type: DataTypes.ENUM('info', 'warn', 'error', 'debug'),
    defaultValue: 'info'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'release_logs',
  indexes: [
    { fields: ['releaseId'] },
    { fields: ['stepId'] },
    { fields: ['level'] },
    { fields: ['timestamp'] }
  ]
});

// Define associations
Release.hasMany(ReleaseStep, { foreignKey: 'releaseId', as: 'steps' });
ReleaseStep.belongsTo(Release, { foreignKey: 'releaseId' });

Release.hasMany(ReleaseLog, { foreignKey: 'releaseId', as: 'logs' });
ReleaseLog.belongsTo(Release, { foreignKey: 'releaseId' });

ReleaseStep.hasMany(ReleaseLog, { foreignKey: 'stepId', as: 'logs' });
ReleaseLog.belongsTo(ReleaseStep, { foreignKey: 'stepId' });

Conversation.hasMany(Release, { foreignKey: 'conversationId', as: 'releases' });
Release.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync all models
    await sequelize.sync({ force: true });
    logger.info('Database models synchronized');
    
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
  ReleaseLog
};

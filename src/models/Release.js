const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

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
    {
      fields: ['version']
    },
    {
      fields: ['status']
    },
    {
      fields: ['environment']
    }
  ]
});

module.exports = Release;

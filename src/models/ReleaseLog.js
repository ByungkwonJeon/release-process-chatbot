const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const ReleaseLog = sequelize.define('ReleaseLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  level: {
    type: DataTypes.ENUM('debug', 'info', 'warn', 'error'),
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
  source: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  releaseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  stepId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'release_logs',
  indexes: [
    {
      fields: ['releaseId']
    },
    {
      fields: ['stepId']
    },
    {
      fields: ['level']
    },
    {
      fields: ['timestamp']
    }
  ]
});

module.exports = ReleaseLog;

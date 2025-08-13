const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

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
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'conversations',
  indexes: [
    {
      fields: ['sessionId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Conversation;

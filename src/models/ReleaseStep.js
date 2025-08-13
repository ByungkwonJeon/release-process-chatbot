const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const ReleaseStep = sequelize.define('ReleaseStep', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  stepType: {
    type: DataTypes.ENUM(
      'create_branch',
      'generate_release_notes',
      'build_infrastructure',
      'build_services',
      'deploy_infrastructure',
      'deploy_services',
      'verify_deployment'
    ),
    allowNull: false
  },
  stepOrder: {
    type: DataTypes.INTEGER,
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
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  output: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  releaseId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'release_steps',
  indexes: [
    {
      fields: ['releaseId']
    },
    {
      fields: ['stepType']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = ReleaseStep;

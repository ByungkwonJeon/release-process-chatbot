const { Tool } = require('@modelcontextprotocol/sdk');
const { logger } = require('../../utils/logger');
const { Release, ReleaseStep, ReleaseLog } = require('../../models/database');

class ReleaseTool extends Tool {
  constructor() {
    super({
      name: 'release',
      description: 'Orchestrate complete release process workflows',
      version: '1.0.0'
    });
  }

  async createRelease(args) {
    try {
      const { version, environment, applications, sprintId } = args;
      
      if (!version || !environment || !applications) {
        throw new Error('Version, environment, and applications are required');
      }

      logger.info(`Creating new release: ${version} for environment: ${environment}`);
      
      // Create release record
      const release = await Release.create({
        version,
        environment,
        applications,
        status: 'pending',
        startedAt: new Date()
      });

      // Create step records
      const steps = [
        { stepType: 'create_branch', stepOrder: 1, name: 'Create Release Branch' },
        { stepType: 'generate_release_notes', stepOrder: 2, name: 'Generate Release Notes' },
        { stepType: 'build_infrastructure', stepOrder: 3, name: 'Build Infrastructure' },
        { stepType: 'build_services', stepOrder: 4, name: 'Build Services' },
        { stepType: 'deploy_infrastructure', stepOrder: 5, name: 'Deploy Infrastructure' },
        { stepType: 'deploy_services', stepOrder: 6, name: 'Deploy Services' },
        { stepType: 'verify_deployment', stepOrder: 7, name: 'Verify Deployment' }
      ];

      const stepPromises = steps.map(step => 
        ReleaseStep.create({
          stepType: step.stepType,
          stepOrder: step.stepOrder,
          status: 'pending',
          releaseId: release.id
        })
      );

      await Promise.all(stepPromises);

      // Add initial log
      await ReleaseLog.create({
        level: 'info',
        message: `Release ${version} created for ${environment} environment`,
        releaseId: release.id
      });

      logger.info(`Release ${version} created successfully with ID: ${release.id}`);
      
      return {
        success: true,
        release: {
          id: release.id,
          version: release.version,
          environment: release.environment,
          status: release.status,
          startedAt: release.startedAt
        },
        message: `Release ${version} created successfully`
      };
    } catch (error) {
      logger.error('Failed to create release:', error.message);
      throw error;
    }
  }

  async getReleaseStatus(args) {
    try {
      const { releaseId } = args;
      
      if (!releaseId) {
        throw new Error('Release ID is required');
      }

      const release = await Release.findByPk(releaseId, {
        include: [
          {
            model: ReleaseStep,
            as: 'steps',
            order: [['stepOrder', 'ASC']]
          }
        ]
      });

      if (!release) {
        throw new Error(`Release ${releaseId} not found`);
      }

      return {
        success: true,
        release: {
          id: release.id,
          version: release.version,
          environment: release.environment,
          status: release.status,
          startedAt: release.startedAt,
          completedAt: release.completedAt
        },
        steps: release.steps.map(step => ({
          stepType: step.stepType,
          stepOrder: step.stepOrder,
          status: step.status,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          duration: step.duration,
          errorMessage: step.errorMessage
        })),
        message: `Release status retrieved for ${release.version}`
      };
    } catch (error) {
      logger.error(`Failed to get release status for ${releaseId}:`, error.message);
      throw error;
    }
  }

  async getReleaseLogs(args) {
    try {
      const { releaseId, stepId, level, limit = 100 } = args;
      
      if (!releaseId) {
        throw new Error('Release ID is required');
      }

      const whereClause = { releaseId };
      if (stepId) {
        whereClause.stepId = stepId;
      }

      const logs = await ReleaseLog.findAll({
        where: whereClause,
        order: [['timestamp', 'ASC']]
      });

      // Filter by level if specified
      let filteredLogs = logs;
      if (level) {
        filteredLogs = logs.filter(log => log.level === level);
      }

      // Limit results
      filteredLogs = filteredLogs.slice(-parseInt(limit));

      return {
        success: true,
        logs: filteredLogs.map(log => ({
          id: log.id,
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          source: log.source,
          stepId: log.stepId
        })),
        total: logs.length,
        filtered: filteredLogs.length,
        message: `Retrieved ${filteredLogs.length} logs for release ${releaseId}`
      };
    } catch (error) {
      logger.error(`Failed to get release logs for ${releaseId}:`, error.message);
      throw error;
    }
  }

  async updateStepStatus(args) {
    try {
      const { releaseId, stepType, status, output, errorMessage } = args;
      
      if (!releaseId || !stepType || !status) {
        throw new Error('Release ID, step type, and status are required');
      }

      const step = await ReleaseStep.findOne({
        where: { releaseId, stepType }
      });

      if (!step) {
        throw new Error(`Step ${stepType} not found for release ${releaseId}`);
      }

      step.status = status;
      
      if (status === 'in_progress' && !step.startedAt) {
        step.startedAt = new Date();
      }
      
      if (status === 'completed' || status === 'failed') {
        step.completedAt = new Date();
        if (step.startedAt) {
          step.duration = Math.floor((step.completedAt - step.startedAt) / 1000);
        }
      }
      
      if (output) {
        step.output = output;
      }
      
      if (errorMessage) {
        step.errorMessage = errorMessage;
      }

      await step.save();

      // Add log entry
      await ReleaseLog.create({
        level: status === 'failed' ? 'error' : 'info',
        message: `Step ${stepType} ${status}`,
        releaseId,
        stepId: step.id
      });

      return {
        success: true,
        step: {
          stepType: step.stepType,
          status: step.status,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          duration: step.duration
        },
        message: `Step ${stepType} status updated to ${status}`
      };
    } catch (error) {
      logger.error(`Failed to update step status for ${releaseId}:`, error.message);
      throw error;
    }
  }

  async completeRelease(args) {
    try {
      const { releaseId, status = 'completed' } = args;
      
      if (!releaseId) {
        throw new Error('Release ID is required');
      }

      const release = await Release.findByPk(releaseId);
      if (!release) {
        throw new Error(`Release ${releaseId} not found`);
      }

      release.status = status;
      release.completedAt = new Date();
      await release.save();

      // Add completion log
      await ReleaseLog.create({
        level: status === 'completed' ? 'info' : 'error',
        message: `Release ${release.version} ${status}`,
        releaseId: release.id
      });

      return {
        success: true,
        release: {
          id: release.id,
          version: release.version,
          status: release.status,
          completedAt: release.completedAt
        },
        message: `Release ${release.version} marked as ${status}`
      };
    } catch (error) {
      logger.error(`Failed to complete release ${releaseId}:`, error.message);
      throw error;
    }
  }

  async getReleases(args) {
    try {
      const { page = 1, limit = 10, status, environment } = args;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (environment) whereClause.environment = environment;

      const releases = await Release.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: ReleaseStep,
            as: 'steps',
            attributes: ['stepType', 'status', 'startedAt', 'completedAt']
          }
        ]
      });

      return {
        success: true,
        releases: releases.rows.map(release => ({
          id: release.id,
          version: release.version,
          environment: release.environment,
          status: release.status,
          startedAt: release.startedAt,
          completedAt: release.completedAt,
          applications: release.applications,
          steps: release.steps.map(step => ({
            stepType: step.stepType,
            status: step.status,
            startedAt: step.startedAt,
            completedAt: step.completedAt
          }))
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: releases.count,
          pages: Math.ceil(releases.count / limit)
        },
        message: `Retrieved ${releases.rows.length} releases`
      };
    } catch (error) {
      logger.error('Failed to get releases:', error.message);
      throw error;
    }
  }

  async addReleaseLog(args) {
    try {
      const { releaseId, level, message, stepId, source } = args;
      
      if (!releaseId || !level || !message) {
        throw new Error('Release ID, level, and message are required');
      }

      const log = await ReleaseLog.create({
        level,
        message,
        timestamp: new Date(),
        source,
        releaseId,
        stepId
      });

      return {
        success: true,
        log: {
          id: log.id,
          level: log.level,
          message: log.message,
          timestamp: log.timestamp,
          source: log.source,
          stepId: log.stepId
        },
        message: 'Release log added successfully'
      };
    } catch (error) {
      logger.error(`Failed to add release log for ${releaseId}:`, error.message);
      throw error;
    }
  }

  async getReleaseStatistics(args) {
    try {
      const { period = '30d' } = args;

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const releases = await Release.findAll({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: startDate
          }
        }
      });

      const statistics = {
        total: releases.length,
        byStatus: {
          pending: releases.filter(r => r.status === 'pending').length,
          in_progress: releases.filter(r => r.status === 'in_progress').length,
          completed: releases.filter(r => r.status === 'completed').length,
          failed: releases.filter(r => r.status === 'failed').length,
          cancelled: releases.filter(r => r.status === 'cancelled').length
        },
        byEnvironment: {
          development: releases.filter(r => r.environment === 'development').length,
          staging: releases.filter(r => r.environment === 'staging').length,
          production: releases.filter(r => r.environment === 'production').length
        },
        averageDuration: 0
      };

      // Calculate average duration for completed releases
      const completedReleases = releases.filter(r => r.status === 'completed' && r.completedAt);
      if (completedReleases.length > 0) {
        const totalDuration = completedReleases.reduce((sum, release) => {
          return sum + (release.completedAt - release.startedAt);
        }, 0);
        statistics.averageDuration = Math.round(totalDuration / completedReleases.length / 1000 / 60); // in minutes
      }

      return {
        success: true,
        statistics,
        period,
        message: `Release statistics calculated for ${period} period`
      };
    } catch (error) {
      logger.error('Failed to get release statistics:', error.message);
      throw error;
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'release',
      description: 'Orchestrate complete release process workflows',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['createRelease', 'getReleaseStatus', 'getReleaseLogs', 'updateStepStatus', 'completeRelease', 'getReleases', 'addReleaseLog', 'getReleaseStatistics'],
            description: 'The action to perform'
          },
          releaseId: {
            type: 'string',
            description: 'Release ID'
          },
          version: {
            type: 'string',
            description: 'Release version'
          },
          environment: {
            type: 'string',
            description: 'Target environment'
          },
          applications: {
            type: 'object',
            description: 'Applications configuration'
          },
          sprintId: {
            type: 'string',
            description: 'Jira sprint ID'
          },
          stepType: {
            type: 'string',
            description: 'Step type to update'
          },
          status: {
            type: 'string',
            description: 'Status to set'
          },
          output: {
            type: 'object',
            description: 'Step output data'
          },
          errorMessage: {
            type: 'string',
            description: 'Error message for failed steps'
          },
          stepId: {
            type: 'string',
            description: 'Step ID for logs'
          },
          level: {
            type: 'string',
            enum: ['debug', 'info', 'warn', 'error'],
            description: 'Log level'
          },
          message: {
            type: 'string',
            description: 'Log message'
          },
          source: {
            type: 'string',
            description: 'Log source'
          },
          page: {
            type: 'number',
            description: 'Page number for pagination'
          },
          limit: {
            type: 'number',
            description: 'Number of items per page'
          },
          period: {
            type: 'string',
            description: 'Time period for statistics'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'createRelease':
        return await this.createRelease(params);
      case 'getReleaseStatus':
        return await this.getReleaseStatus(params);
      case 'getReleaseLogs':
        return await this.getReleaseLogs(params);
      case 'updateStepStatus':
        return await this.updateStepStatus(params);
      case 'completeRelease':
        return await this.completeRelease(params);
      case 'getReleases':
        return await this.getReleases(params);
      case 'addReleaseLog':
        return await this.addReleaseLog(params);
      case 'getReleaseStatistics':
        return await this.getReleaseStatistics(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = ReleaseTool;

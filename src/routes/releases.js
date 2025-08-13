const express = require('express');
const { logger } = require('../utils/logger');
const releaseWorkflow = require('../workflows/ReleaseWorkflow');
const { Release, ReleaseStep, ReleaseLog } = require('../models/database');

const router = express.Router();

// Get all releases
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, environment } = req.query;
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

    res.json({
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
      }
    });
  } catch (error) {
    logger.error('Failed to get releases:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get releases'
    });
  }
});

// Get specific release
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const release = await Release.findByPk(id, {
      include: [
        {
          model: ReleaseStep,
          as: 'steps',
          order: [['stepOrder', 'ASC']]
        }
      ]
    });

    if (!release) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    res.json({
      success: true,
      release: {
        id: release.id,
        version: release.version,
        environment: release.environment,
        status: release.status,
        startedAt: release.startedAt,
        completedAt: release.completedAt,
        applications: release.applications,
        releaseBranch: release.releaseBranch,
        releaseNotes: release.releaseNotes,
        steps: release.steps.map(step => ({
          id: step.id,
          stepType: step.stepType,
          stepOrder: step.stepOrder,
          status: step.status,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          duration: step.duration,
          errorMessage: step.errorMessage,
          output: step.output
        }))
      }
    });
  } catch (error) {
    logger.error('Failed to get release:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get release'
    });
  }
});

// Create new release
router.post('/', async (req, res) => {
  try {
    const { version, environment, applications, sprintId } = req.body;

    if (!version || !environment || !applications) {
      return res.status(400).json({
        success: false,
        error: 'Version, environment, and applications are required'
      });
    }

    const release = await releaseWorkflow.createRelease(
      version,
      environment,
      applications,
      sprintId
    );

    res.status(201).json({
      success: true,
      release: {
        id: release.id,
        version: release.version,
        environment: release.environment,
        status: release.status,
        startedAt: release.startedAt
      },
      message: `Release ${version} created successfully`
    });
  } catch (error) {
    logger.error('Failed to create release:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create release',
      message: error.message
    });
  }
});

// Execute full release
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { options = {} } = req.body;

    const release = await Release.findByPk(id);
    if (!release) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    // Execute the full release process
    const result = await releaseWorkflow.executeFullRelease(
      release.version,
      release.environment,
      release.applications,
      options
    );

    res.json({
      success: true,
      release: {
        id: result.id,
        version: result.version,
        environment: result.environment,
        status: result.status
      },
      message: `Release ${result.version} executed successfully`
    });
  } catch (error) {
    logger.error('Failed to execute release:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to execute release',
      message: error.message
    });
  }
});

// Execute specific step
router.post('/:id/step/:stepId/execute', async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { options = {} } = req.body;

    const release = await Release.findByPk(id);
    if (!release) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    const result = await releaseWorkflow.executeStep(id, stepId, options);

    res.json({
      success: true,
      step: stepId,
      result,
      message: `Step ${stepId} executed successfully`
    });
  } catch (error) {
    logger.error('Failed to execute step:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to execute step',
      message: error.message
    });
  }
});

// Get release status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const status = await releaseWorkflow.getReleaseStatus(id);

    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Failed to get release status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get release status',
      message: error.message
    });
  }
});

// Get release logs
router.get('/:id/logs', async (req, res) => {
  try {
    const { id } = req.params;
    const { stepId, level, limit = 100 } = req.query;

    const logs = await releaseWorkflow.getReleaseLogs(id, stepId);

    // Filter by level if specified
    let filteredLogs = logs;
    if (level) {
      filteredLogs = logs.filter(log => log.level === level);
    }

    // Limit results
    filteredLogs = filteredLogs.slice(-parseInt(limit));

    res.json({
      success: true,
      logs: filteredLogs,
      total: logs.length,
      filtered: filteredLogs.length
    });
  } catch (error) {
    logger.error('Failed to get release logs:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get release logs',
      message: error.message
    });
  }
});

// Cancel release
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const release = await Release.findByPk(id);
    if (!release) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    if (release.status === 'completed' || release.status === 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed or failed release'
      });
    }

    release.status = 'cancelled';
    release.completedAt = new Date();
    await release.save();

    // Add cancellation log
    await ReleaseLog.create({
      level: 'info',
      message: `Release ${release.version} cancelled by user`,
      releaseId: release.id
    });

    res.json({
      success: true,
      message: `Release ${release.version} cancelled successfully`
    });
  } catch (error) {
    logger.error('Failed to cancel release:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel release',
      message: error.message
    });
  }
});

// Retry failed step
router.post('/:id/step/:stepId/retry', async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { options = {} } = req.body;

    const step = await ReleaseStep.findOne({
      where: { releaseId: id, stepType: stepId }
    });

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found'
      });
    }

    if (step.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Can only retry failed steps'
      });
    }

    // Reset step status
    step.status = 'pending';
    step.startedAt = null;
    step.completedAt = null;
    step.duration = null;
    step.errorMessage = null;
    step.output = {};
    await step.save();

    // Execute the step
    const result = await releaseWorkflow.executeStep(id, stepId, options);

    res.json({
      success: true,
      step: stepId,
      result,
      message: `Step ${stepId} retried successfully`
    });
  } catch (error) {
    logger.error('Failed to retry step:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retry step',
      message: error.message
    });
  }
});

// Get release statistics
router.get('/statistics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

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

    res.json({
      success: true,
      statistics,
      period
    });
  } catch (error) {
    logger.error('Failed to get release statistics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get release statistics'
    });
  }
});

module.exports = router;

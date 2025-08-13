const { logger } = require('../utils/logger');
const { Release, ReleaseStep, ReleaseLog } = require('../models/database');
const mcpClient = require('../services/mcpClient');

class ReleaseWorkflow {
  constructor() {
    this.steps = [
      { id: 'create_branch', name: 'Create Release Branch', order: 1 },
      { id: 'generate_release_notes', name: 'Generate Release Notes', order: 2 },
      { id: 'build_infrastructure', name: 'Build Infrastructure', order: 3 },
      { id: 'build_services', name: 'Build Services', order: 4 },
      { id: 'deploy_infrastructure', name: 'Deploy Infrastructure', order: 5 },
      { id: 'deploy_services', name: 'Deploy Services', order: 6 },
      { id: 'verify_deployment', name: 'Verify Deployment', order: 7 }
    ];
  }

  async createRelease(version, environment, applications, sprintId = null) {
    try {
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
      const stepPromises = this.steps.map(step => 
        ReleaseStep.create({
          stepType: step.id,
          stepOrder: step.order,
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
      return release;
    } catch (error) {
      logger.error('Failed to create release:', error.message);
      throw error;
    }
  }

  async executeStep(releaseId, stepType, options = {}) {
    try {
      logger.info(`Executing step ${stepType} for release ${releaseId}`);
      
      const release = await Release.findByPk(releaseId);
      if (!release) {
        throw new Error(`Release ${releaseId} not found`);
      }

      const step = await ReleaseStep.findOne({
        where: { releaseId, stepType }
      });

      if (!step) {
        throw new Error(`Step ${stepType} not found for release ${releaseId}`);
      }

      // Update step status
      step.status = 'in_progress';
      step.startedAt = new Date();
      await step.save();

      // Add log entry
      await ReleaseLog.create({
        level: 'info',
        message: `Starting ${stepType} step`,
        releaseId,
        stepId: step.id
      });

      let result;
      switch (stepType) {
        case 'create_branch':
          result = await this.executeCreateBranch(release, options);
          break;
        case 'generate_release_notes':
          result = await this.executeGenerateReleaseNotes(release, options);
          break;
        case 'build_infrastructure':
          result = await this.executeBuildInfrastructure(release, options);
          break;
        case 'build_services':
          result = await this.executeBuildServices(release, options);
          break;
        case 'deploy_infrastructure':
          result = await this.executeDeployInfrastructure(release, options);
          break;
        case 'deploy_services':
          result = await this.executeDeployServices(release, options);
          break;
        case 'verify_deployment':
          result = await this.executeVerifyDeployment(release, options);
          break;
        default:
          throw new Error(`Unknown step type: ${stepType}`);
      }

      // Update step status
      step.status = 'completed';
      step.completedAt = new Date();
      step.duration = Math.floor((step.completedAt - step.startedAt) / 1000);
      step.output = result;
      await step.save();

      // Add completion log
      await ReleaseLog.create({
        level: 'info',
        message: `${stepType} step completed successfully`,
        releaseId,
        stepId: step.id
      });

      logger.info(`Step ${stepType} completed successfully for release ${releaseId}`);
      return result;
    } catch (error) {
      logger.error(`Step ${stepType} failed for release ${releaseId}:`, error.message);
      
      // Update step status to failed
      const step = await ReleaseStep.findOne({
        where: { releaseId, stepType }
      });
      
      if (step) {
        step.status = 'failed';
        step.completedAt = new Date();
        step.duration = Math.floor((step.completedAt - step.startedAt) / 1000);
        step.errorMessage = error.message;
        await step.save();
      }

      // Add error log
      await ReleaseLog.create({
        level: 'error',
        message: `${stepType} step failed: ${error.message}`,
        releaseId,
        stepId: step?.id
      });

      throw error;
    }
  }

  async executeCreateBranch(release, options) {
    try {
      logger.info(`Creating release branch for version ${release.version}`);
      
      const result = await mcpClient.createReleaseBranch(
        release.version,
        options.sourceBranch || 'main'
      );

      // Update release with branch info
      release.releaseBranch = result.branchName;
      await release.save();

      await ReleaseLog.create({
        level: 'info',
        message: `Release branch created: ${result.branchName}`,
        releaseId: release.id
      });

      return result;
    } catch (error) {
      logger.error('Failed to create release branch:', error.message);
      throw error;
    }
  }

  async executeGenerateReleaseNotes(release, options) {
    try {
      logger.info(`Generating release notes for version ${release.version}`);
      
      if (!options.sprintId) {
        throw new Error('Sprint ID is required to generate release notes');
      }

      const result = await mcpClient.generateReleaseNotes(options.sprintId, release.version);

      // Update release with release notes
      release.releaseNotes = result.releaseNotes;
      await release.save();

      await ReleaseLog.create({
        level: 'info',
        message: `Release notes generated with ${result.summary.total} stories`,
        releaseId: release.id
      });

      return result;
    } catch (error) {
      logger.error('Failed to generate release notes:', error.message);
      throw error;
    }
  }

  async executeBuildInfrastructure(release, options) {
    try {
      logger.info(`Building infrastructure for ${release.environment}`);
      
      const result = await mcpClient.buildInfrastructure(release.environment);

      await ReleaseLog.create({
        level: 'info',
        message: `Infrastructure built successfully for ${release.environment}`,
        releaseId: release.id
      });

      return result;
    } catch (error) {
      logger.error('Failed to build infrastructure:', error.message);
      throw error;
    }
  }

  async executeBuildServices(release, options) {
    try {
      logger.info(`Building services for release ${release.version}`);
      
      const applications = release.applications || [];
      const buildResults = {};

      for (const app of applications) {
        logger.info(`Building application: ${app.name}`);
        
        // This would integrate with your build system (Jenkins, GitLab CI, etc.)
        // For now, we'll simulate the build process
        buildResults[app.name] = {
          success: true,
          buildId: `build-${Date.now()}`,
          artifactUrl: `https://artifacts.example.com/${app.name}/${release.version}`,
          buildTime: new Date().toISOString()
        };

        await ReleaseLog.create({
          level: 'info',
          message: `Service ${app.name} built successfully`,
          releaseId: release.id
        });
      }

      return buildResults;
    } catch (error) {
      logger.error('Failed to build services:', error.message);
      throw error;
    }
  }

  async executeDeployInfrastructure(release, options) {
    try {
      logger.info(`Deploying infrastructure for ${release.environment}`);
      
      // Infrastructure is already deployed from the build step
      // This step might involve additional configuration or validation
      
      await ReleaseLog.create({
        level: 'info',
        message: `Infrastructure deployment completed for ${release.environment}`,
        releaseId: release.id
      });

      return { success: true, message: 'Infrastructure deployment completed' };
    } catch (error) {
      logger.error('Failed to deploy infrastructure:', error.message);
      throw error;
    }
  }

  async executeDeployServices(release, options) {
    try {
      logger.info(`Deploying services for release ${release.version}`);
      
      const applications = release.applications || [];
      const deploymentResults = {};

      for (const app of applications) {
        logger.info(`Deploying application: ${app.name}`);
        
        const result = await mcpClient.deployApplication(
          app.name,
          release.environment,
          release.version,
          app.artifacts || []
        );

        deploymentResults[app.name] = result;

        await ReleaseLog.create({
          level: 'info',
          message: `Service ${app.name} deployment triggered: ${result.executionId}`,
          releaseId: release.id
        });
      }

      return deploymentResults;
    } catch (error) {
      logger.error('Failed to deploy services:', error.message);
      throw error;
    }
  }

  async executeVerifyDeployment(release, options) {
    try {
      logger.info(`Verifying deployment for ${release.environment}`);
      
      const result = await mcpClient.verifyDeployment(
        release.environment,
        release.applications || {}
      );

      await ReleaseLog.create({
        level: 'info',
        message: `Deployment verification completed. Status: ${result.overallStatus}`,
        releaseId: release.id
      });

      return result;
    } catch (error) {
      logger.error('Failed to verify deployment:', error.message);
      throw error;
    }
  }

  async executeFullRelease(version, environment, applications, options = {}) {
    try {
      logger.info(`Starting full release process for version ${version}`);
      
      // Create release
      const release = await this.createRelease(version, environment, applications, options.sprintId);
      
      // Update release status
      release.status = 'in_progress';
      await release.save();

      // Execute all steps sequentially
      for (const step of this.steps) {
        try {
          await this.executeStep(release.id, step.id, options);
        } catch (error) {
          logger.error(`Step ${step.id} failed, stopping release process`);
          
          // Update release status to failed
          release.status = 'failed';
          release.completedAt = new Date();
          await release.save();
          
          throw error;
        }
      }

      // Update release status to completed
      release.status = 'completed';
      release.completedAt = new Date();
      await release.save();

      await ReleaseLog.create({
        level: 'info',
        message: `Release ${version} completed successfully`,
        releaseId: release.id
      });

      logger.info(`Full release process completed for version ${version}`);
      return release;
    } catch (error) {
      logger.error(`Full release process failed for version ${version}:`, error.message);
      throw error;
    }
  }

  async getReleaseStatus(releaseId) {
    try {
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
        }))
      };
    } catch (error) {
      logger.error(`Failed to get release status for ${releaseId}:`, error.message);
      throw error;
    }
  }

  async getReleaseLogs(releaseId, stepId = null) {
    try {
      const whereClause = { releaseId };
      if (stepId) {
        whereClause.stepId = stepId;
      }

      const logs = await ReleaseLog.findAll({
        where: whereClause,
        order: [['timestamp', 'ASC']]
      });

      return logs.map(log => ({
        id: log.id,
        level: log.level,
        message: log.message,
        timestamp: log.timestamp,
        source: log.source,
        stepId: log.stepId
      }));
    } catch (error) {
      logger.error(`Failed to get release logs for ${releaseId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new ReleaseWorkflow();

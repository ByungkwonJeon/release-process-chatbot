const { Tool } = require('@modelcontextprotocol/sdk');
const axios = require('axios');
const { logger } = require('../../utils/logger');

class SpinnakerTool extends Tool {
  constructor() {
    super({
      name: 'spinnaker',
      description: 'Manage application deployments via Spinnaker',
      version: '1.0.0'
    });

    this.host = process.env.SPINNAKER_HOST;
    this.username = process.env.SPINNAKER_USERNAME;
    this.password = process.env.SPINNAKER_PASSWORD;
    
    this.client = axios.create({
      baseURL: this.host,
      auth: {
        username: this.username,
        password: this.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getApplications() {
    try {
      logger.info('Fetching Spinnaker applications...');
      const response = await this.client.get('/applications');
      logger.info(`Found ${response.data.length} applications`);
      
      return {
        success: true,
        applications: response.data,
        total: response.data.length,
        message: `Retrieved ${response.data.length} applications from Spinnaker`
      };
    } catch (error) {
      logger.error('Failed to fetch applications:', error.response?.data || error.message);
      throw new Error(`Failed to fetch applications: ${error.response?.data?.message || error.message}`);
    }
  }

  async getApplication(args) {
    try {
      const { applicationName } = args;
      
      if (!applicationName) {
        throw new Error('Application name is required');
      }

      logger.info(`Fetching application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}`);
      
      return {
        success: true,
        application: response.data,
        message: `Application information retrieved for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to fetch application ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch application: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelines(args) {
    try {
      const { applicationName } = args;
      
      if (!applicationName) {
        throw new Error('Application name is required');
      }

      logger.info(`Fetching pipelines for application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}/pipelineConfigs`);
      
      return {
        success: true,
        pipelines: response.data,
        total: response.data.length,
        applicationName,
        message: `Retrieved ${response.data.length} pipelines for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to fetch pipelines for ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipelines: ${error.response?.data?.message || error.message}`);
    }
  }

  async triggerPipeline(args) {
    try {
      const { applicationName, pipelineName, parameters = {} } = args;
      
      if (!applicationName || !pipelineName) {
        throw new Error('Application name and pipeline name are required');
      }

      logger.info(`Triggering pipeline ${pipelineName} for application ${applicationName}`);
      
      const payload = {
        application: applicationName,
        pipelineName: pipelineName,
        parameters: parameters
      };
      
      const response = await this.client.post('/pipelines/v2/executions', payload);
      
      logger.info(`Pipeline ${pipelineName} triggered successfully. Execution ID: ${response.data.id}`);
      
      return {
        success: true,
        executionId: response.data.id,
        status: response.data.status,
        buildTime: response.data.buildTime,
        message: `Pipeline ${pipelineName} triggered successfully`
      };
    } catch (error) {
      logger.error(`Failed to trigger pipeline ${pipelineName}:`, error.response?.data || error.message);
      throw new Error(`Failed to trigger pipeline: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelineExecution(args) {
    try {
      const { executionId } = args;
      
      if (!executionId) {
        throw new Error('Execution ID is required');
      }

      logger.info(`Fetching pipeline execution: ${executionId}`);
      const response = await this.client.get(`/executions/${executionId}`);
      
      return {
        success: true,
        execution: response.data,
        message: `Pipeline execution information retrieved for ${executionId}`
      };
    } catch (error) {
      logger.error(`Failed to fetch pipeline execution ${executionId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipeline execution: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelineExecutions(args) {
    try {
      const { applicationName, limit = 10 } = args;
      
      if (!applicationName) {
        throw new Error('Application name is required');
      }

      logger.info(`Fetching recent pipeline executions for application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}/pipelines`, {
        params: { limit }
      });
      
      return {
        success: true,
        executions: response.data,
        total: response.data.length,
        applicationName,
        message: `Retrieved ${response.data.length} pipeline executions for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to fetch pipeline executions for ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipeline executions: ${error.response?.data?.message || error.message}`);
    }
  }

  async deployApplication(args) {
    try {
      const { applicationName, environment, version, artifacts = [] } = args;
      
      if (!applicationName || !environment || !version) {
        throw new Error('Application name, environment, and version are required');
      }

      logger.info(`Deploying application ${applicationName} version ${version} to ${environment}`);
      
      // Find the deployment pipeline
      const pipelinesResult = await this.getPipelines({ applicationName });
      const deployPipeline = pipelinesResult.pipelines.find(p => 
        p.name.toLowerCase().includes('deploy') && 
        p.name.toLowerCase().includes(environment.toLowerCase())
      );
      
      if (!deployPipeline) {
        throw new Error(`No deployment pipeline found for ${applicationName} in ${environment}`);
      }
      
      const parameters = {
        version: version,
        environment: environment,
        artifacts: JSON.stringify(artifacts)
      };
      
      const result = await this.triggerPipeline({
        applicationName,
        pipelineName: deployPipeline.name,
        parameters
      });
      
      logger.info(`Deployment triggered successfully for ${applicationName}`);
      
      return {
        success: true,
        applicationName,
        environment,
        version,
        executionId: result.executionId,
        message: `Deployment triggered successfully for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to deploy application ${applicationName}:`, error.message);
      throw error;
    }
  }

  async waitForDeployment(args) {
    try {
      const { executionId, timeout = 1800000 } = args; // 30 minutes timeout
      
      if (!executionId) {
        throw new Error('Execution ID is required');
      }

      logger.info(`Waiting for deployment completion: ${executionId}`);
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const execution = await this.getPipelineExecution({ executionId });
        
        if (execution.execution.status === 'SUCCEEDED') {
          logger.info(`Deployment ${executionId} completed successfully`);
          return {
            success: true,
            status: 'SUCCEEDED',
            execution: execution.execution,
            message: `Deployment ${executionId} completed successfully`
          };
        } else if (execution.execution.status === 'FAILED' || execution.execution.status === 'TERMINAL') {
          logger.error(`Deployment ${executionId} failed with status: ${execution.execution.status}`);
          throw new Error(`Deployment failed with status: ${execution.execution.status}`);
        }
        
        // Wait 10 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      throw new Error(`Deployment timeout after ${timeout / 1000} seconds`);
    } catch (error) {
      logger.error(`Error waiting for deployment ${executionId}:`, error.message);
      throw error;
    }
  }

  async getDeploymentStatus(args) {
    try {
      const { applicationName, environment } = args;
      
      if (!applicationName || !environment) {
        throw new Error('Application name and environment are required');
      }

      logger.info(`Getting deployment status for ${applicationName} in ${environment}`);
      
      const executions = await this.getPipelineExecutions({ applicationName, limit: 5 });
      const recentDeployments = executions.executions.filter(exec => 
        exec.name.toLowerCase().includes('deploy') &&
        exec.name.toLowerCase().includes(environment.toLowerCase())
      );
      
      if (recentDeployments.length === 0) {
        return {
          success: true,
          status: 'NO_DEPLOYMENTS_FOUND',
          message: `No recent deployments found for ${applicationName} in ${environment}`
        };
      }
      
      const latestDeployment = recentDeployments[0];
      
      return {
        success: true,
        status: latestDeployment.status,
        lastDeployment: latestDeployment.startTime,
        executionId: latestDeployment.id,
        pipelineName: latestDeployment.name,
        message: `Deployment status retrieved for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to get deployment status for ${applicationName}:`, error.message);
      throw error;
    }
  }

  async rollbackDeployment(args) {
    try {
      const { applicationName, environment, targetExecutionId } = args;
      
      if (!applicationName || !environment || !targetExecutionId) {
        throw new Error('Application name, environment, and target execution ID are required');
      }

      logger.info(`Rolling back deployment for ${applicationName} in ${environment}`);
      
      const pipelines = await this.getPipelines({ applicationName });
      const rollbackPipeline = pipelines.pipelines.find(p => 
        p.name.toLowerCase().includes('rollback') && 
        p.name.toLowerCase().includes(environment.toLowerCase())
      );
      
      if (!rollbackPipeline) {
        throw new Error(`No rollback pipeline found for ${applicationName} in ${environment}`);
      }
      
      const parameters = {
        targetExecutionId: targetExecutionId,
        environment: environment
      };
      
      const result = await this.triggerPipeline({
        applicationName,
        pipelineName: rollbackPipeline.name,
        parameters
      });
      
      logger.info(`Rollback triggered successfully for ${applicationName}`);
      
      return {
        success: true,
        applicationName,
        environment,
        executionId: result.executionId,
        message: `Rollback triggered successfully for ${applicationName}`
      };
    } catch (error) {
      logger.error(`Failed to rollback deployment for ${applicationName}:`, error.message);
      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.getApplications();
      return {
        success: true,
        message: 'Spinnaker credentials are valid'
      };
    } catch (error) {
      logger.error('Spinnaker credentials validation failed:', error.message);
      return {
        success: false,
        message: 'Spinnaker credentials validation failed',
        error: error.message
      };
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'spinnaker',
      description: 'Manage application deployments via Spinnaker',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['getApplications', 'getApplication', 'getPipelines', 'triggerPipeline', 'getPipelineExecution', 'getPipelineExecutions', 'deployApplication', 'waitForDeployment', 'getDeploymentStatus', 'rollbackDeployment', 'validateCredentials'],
            description: 'The action to perform'
          },
          applicationName: {
            type: 'string',
            description: 'Name of the Spinnaker application'
          },
          pipelineName: {
            type: 'string',
            description: 'Name of the pipeline to trigger'
          },
          parameters: {
            type: 'object',
            description: 'Parameters to pass to the pipeline'
          },
          executionId: {
            type: 'string',
            description: 'Pipeline execution ID'
          },
          limit: {
            type: 'number',
            description: 'Number of executions to retrieve'
          },
          environment: {
            type: 'string',
            description: 'Target environment for deployment'
          },
          version: {
            type: 'string',
            description: 'Application version to deploy'
          },
          artifacts: {
            type: 'array',
            description: 'Artifacts to deploy'
          },
          timeout: {
            type: 'number',
            description: 'Timeout in milliseconds for deployment wait'
          },
          targetExecutionId: {
            type: 'string',
            description: 'Target execution ID for rollback'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'getApplications':
        return await this.getApplications();
      case 'getApplication':
        return await this.getApplication(params);
      case 'getPipelines':
        return await this.getPipelines(params);
      case 'triggerPipeline':
        return await this.triggerPipeline(params);
      case 'getPipelineExecution':
        return await this.getPipelineExecution(params);
      case 'getPipelineExecutions':
        return await this.getPipelineExecutions(params);
      case 'deployApplication':
        return await this.deployApplication(params);
      case 'waitForDeployment':
        return await this.waitForDeployment(params);
      case 'getDeploymentStatus':
        return await this.getDeploymentStatus(params);
      case 'rollbackDeployment':
        return await this.rollbackDeployment(params);
      case 'validateCredentials':
        return await this.validateCredentials();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = SpinnakerTool;

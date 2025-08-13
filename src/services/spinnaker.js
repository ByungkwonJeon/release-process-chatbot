const axios = require('axios');
const { logger } = require('../utils/logger');

class SpinnakerService {
  constructor() {
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
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch applications:', error.response?.data || error.message);
      throw new Error(`Failed to fetch applications: ${error.response?.data?.message || error.message}`);
    }
  }

  async getApplication(applicationName) {
    try {
      logger.info(`Fetching application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch application ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch application: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelines(applicationName) {
    try {
      logger.info(`Fetching pipelines for application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}/pipelineConfigs`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch pipelines for ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipelines: ${error.response?.data?.message || error.message}`);
    }
  }

  async triggerPipeline(applicationName, pipelineName, parameters = {}) {
    try {
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
        buildTime: response.data.buildTime
      };
    } catch (error) {
      logger.error(`Failed to trigger pipeline ${pipelineName}:`, error.response?.data || error.message);
      throw new Error(`Failed to trigger pipeline: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelineExecution(executionId) {
    try {
      logger.info(`Fetching pipeline execution: ${executionId}`);
      const response = await this.client.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch pipeline execution ${executionId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipeline execution: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPipelineExecutions(applicationName, limit = 10) {
    try {
      logger.info(`Fetching recent pipeline executions for application: ${applicationName}`);
      const response = await this.client.get(`/applications/${applicationName}/pipelines`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch pipeline executions for ${applicationName}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch pipeline executions: ${error.response?.data?.message || error.message}`);
    }
  }

  async deployApplication(applicationName, environment, version, artifacts = []) {
    try {
      logger.info(`Deploying application ${applicationName} version ${version} to ${environment}`);
      
      // Find the deployment pipeline
      const pipelines = await this.getPipelines(applicationName);
      const deployPipeline = pipelines.find(p => 
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
      
      const result = await this.triggerPipeline(applicationName, deployPipeline.name, parameters);
      
      logger.info(`Deployment triggered successfully for ${applicationName}`);
      return result;
    } catch (error) {
      logger.error(`Failed to deploy application ${applicationName}:`, error.message);
      throw error;
    }
  }

  async waitForDeployment(executionId, timeout = 1800000) { // 30 minutes timeout
    try {
      logger.info(`Waiting for deployment completion: ${executionId}`);
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const execution = await this.getPipelineExecution(executionId);
        
        if (execution.status === 'SUCCEEDED') {
          logger.info(`Deployment ${executionId} completed successfully`);
          return {
            success: true,
            status: 'SUCCEEDED',
            execution: execution
          };
        } else if (execution.status === 'FAILED' || execution.status === 'TERMINAL') {
          logger.error(`Deployment ${executionId} failed with status: ${execution.status}`);
          throw new Error(`Deployment failed with status: ${execution.status}`);
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

  async getDeploymentStatus(applicationName, environment) {
    try {
      logger.info(`Getting deployment status for ${applicationName} in ${environment}`);
      
      const executions = await this.getPipelineExecutions(applicationName, 5);
      const recentDeployments = executions.filter(exec => 
        exec.name.toLowerCase().includes('deploy') &&
        exec.name.toLowerCase().includes(environment.toLowerCase())
      );
      
      if (recentDeployments.length === 0) {
        return { status: 'NO_DEPLOYMENTS_FOUND' };
      }
      
      const latestDeployment = recentDeployments[0];
      return {
        status: latestDeployment.status,
        lastDeployment: latestDeployment.startTime,
        executionId: latestDeployment.id,
        pipelineName: latestDeployment.name
      };
    } catch (error) {
      logger.error(`Failed to get deployment status for ${applicationName}:`, error.message);
      throw error;
    }
  }

  async rollbackDeployment(applicationName, environment, targetExecutionId) {
    try {
      logger.info(`Rolling back deployment for ${applicationName} in ${environment}`);
      
      const pipelines = await this.getPipelines(applicationName);
      const rollbackPipeline = pipelines.find(p => 
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
      
      const result = await this.triggerPipeline(applicationName, rollbackPipeline.name, parameters);
      
      logger.info(`Rollback triggered successfully for ${applicationName}`);
      return result;
    } catch (error) {
      logger.error(`Failed to rollback deployment for ${applicationName}:`, error.message);
      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.getApplications();
      return true;
    } catch (error) {
      logger.error('Spinnaker credentials validation failed:', error.message);
      return false;
    }
  }
}

module.exports = new SpinnakerService();

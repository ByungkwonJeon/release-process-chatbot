const { Tool } = require('@modelcontextprotocol/sdk/server/tools');
const AWS = require('aws-sdk');
const { logger } = require('../../utils/logger');

class AWSTool extends Tool {
  constructor() {
    super({
      name: 'aws',
      description: 'Verify and monitor AWS resources and deployments',
      version: '1.0.0'
    });

    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    // Initialize AWS services
    this.ec2 = new AWS.EC2();
    this.ecs = new AWS.ECS();
    this.elbv2 = new AWS.ELBv2();
    this.rds = new AWS.RDS();
    this.cloudwatch = new AWS.CloudWatch();
    this.lambda = new AWS.Lambda();
    this.s3 = new AWS.S3();
  }

  async verifyEC2Instances(args) {
    try {
      const { clusterName } = args;
      
      if (!clusterName) {
        throw new Error('Cluster name is required');
      }

      logger.info(`Verifying EC2 instances for cluster: ${clusterName}`);
      
      const params = {
        Filters: [
          {
            Name: 'tag:Name',
            Values: [`*${clusterName}*`]
          },
          {
            Name: 'instance-state-name',
            Values: ['running']
          }
        ]
      };

      const result = await this.ec2.describeInstances(params).promise();
      const instances = result.Reservations.flatMap(reservation => reservation.Instances);
      
      logger.info(`Found ${instances.length} running EC2 instances for cluster ${clusterName}`);
      
      return {
        success: true,
        instanceCount: instances.length,
        instances: instances.map(instance => ({
          instanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          state: instance.State.Name,
          privateIp: instance.PrivateIpAddress,
          publicIp: instance.PublicIpAddress,
          launchTime: instance.LaunchTime
        })),
        message: `Verified ${instances.length} EC2 instances for cluster ${clusterName}`
      };
    } catch (error) {
      logger.error('Failed to verify EC2 instances:', error.message);
      throw error;
    }
  }

  async verifyECSServices(args) {
    try {
      const { clusterName } = args;
      
      if (!clusterName) {
        throw new Error('Cluster name is required');
      }

      logger.info(`Verifying ECS services for cluster: ${clusterName}`);
      
      const services = await this.ecs.listServices({ cluster: clusterName }).promise();
      
      if (services.serviceArns.length === 0) {
        return {
          success: true,
          serviceCount: 0,
          services: [],
          message: `No ECS services found in cluster ${clusterName}`
        };
      }

      const serviceDetails = await this.ecs.describeServices({
        cluster: clusterName,
        services: services.serviceArns
      }).promise();

      const healthyServices = serviceDetails.services.filter(service => 
        service.desiredCount === service.runningCount && 
        service.desiredCount === service.pendingCount
      );

      logger.info(`Found ${healthyServices.length} healthy ECS services in cluster ${clusterName}`);
      
      return {
        success: true,
        serviceCount: healthyServices.length,
        totalServices: serviceDetails.services.length,
        services: healthyServices.map(service => ({
          serviceName: service.serviceName,
          desiredCount: service.desiredCount,
          runningCount: service.runningCount,
          pendingCount: service.pendingCount,
          status: service.status
        })),
        message: `Verified ${healthyServices.length} healthy ECS services in cluster ${clusterName}`
      };
    } catch (error) {
      logger.error('Failed to verify ECS services:', error.message);
      throw error;
    }
  }

  async verifyLoadBalancers(args) {
    try {
      const { loadBalancerNames } = args;
      
      if (!loadBalancerNames || !Array.isArray(loadBalancerNames)) {
        throw new Error('Load balancer names array is required');
      }

      logger.info(`Verifying load balancers: ${loadBalancerNames.join(', ')}`);
      
      const loadBalancers = await this.elbv2.describeLoadBalancers({
        Names: loadBalancerNames
      }).promise();

      const healthyLoadBalancers = loadBalancers.LoadBalancers.filter(lb => 
        lb.State.Code === 'active'
      );

      logger.info(`Found ${healthyLoadBalancers.length} healthy load balancers`);
      
      return {
        success: true,
        loadBalancerCount: healthyLoadBalancers.length,
        loadBalancers: healthyLoadBalancers.map(lb => ({
          name: lb.LoadBalancerName,
          arn: lb.LoadBalancerArn,
          type: lb.Type,
          state: lb.State.Code,
          dnsName: lb.DNSName
        })),
        message: `Verified ${healthyLoadBalancers.length} healthy load balancers`
      };
    } catch (error) {
      logger.error('Failed to verify load balancers:', error.message);
      throw error;
    }
  }

  async verifyRDSInstances(args) {
    try {
      const { dbInstanceIdentifiers } = args;
      
      if (!dbInstanceIdentifiers || !Array.isArray(dbInstanceIdentifiers)) {
        throw new Error('DB instance identifiers array is required');
      }

      logger.info(`Verifying RDS instances: ${dbInstanceIdentifiers.join(', ')}`);
      
      const dbInstances = await this.rds.describeDBInstances({
        DBInstanceIdentifier: dbInstanceIdentifiers
      }).promise();

      const availableInstances = dbInstances.DBInstances.filter(instance => 
        instance.DBInstanceStatus === 'available'
      );

      logger.info(`Found ${availableInstances.length} available RDS instances`);
      
      return {
        success: true,
        instanceCount: availableInstances.length,
        instances: availableInstances.map(instance => ({
          identifier: instance.DBInstanceIdentifier,
          engine: instance.Engine,
          status: instance.DBInstanceStatus,
          endpoint: instance.Endpoint?.Address,
          port: instance.Endpoint?.Port
        })),
        message: `Verified ${availableInstances.length} available RDS instances`
      };
    } catch (error) {
      logger.error('Failed to verify RDS instances:', error.message);
      throw error;
    }
  }

  async verifyLambdaFunctions(args) {
    try {
      const { functionNames } = args;
      
      if (!functionNames || !Array.isArray(functionNames)) {
        throw new Error('Function names array is required');
      }

      logger.info(`Verifying Lambda functions: ${functionNames.join(', ')}`);
      
      const functions = await Promise.all(
        functionNames.map(async (functionName) => {
          try {
            const functionInfo = await this.lambda.getFunction({
              FunctionName: functionName
            }).promise();
            return functionInfo;
          } catch (error) {
            logger.warn(`Failed to get function info for ${functionName}:`, error.message);
            return null;
          }
        })
      );

      const availableFunctions = functions.filter(fn => fn !== null);

      logger.info(`Found ${availableFunctions.length} available Lambda functions`);
      
      return {
        success: true,
        functionCount: availableFunctions.length,
        functions: availableFunctions.map(fn => ({
          functionName: fn.Configuration.FunctionName,
          runtime: fn.Configuration.Runtime,
          handler: fn.Configuration.Handler,
          codeSize: fn.Configuration.CodeSize,
          description: fn.Configuration.Description
        })),
        message: `Verified ${availableFunctions.length} available Lambda functions`
      };
    } catch (error) {
      logger.error('Failed to verify Lambda functions:', error.message);
      throw error;
    }
  }

  async checkCloudWatchMetrics(args) {
    try {
      const { namespace, metricName, dimensions, period = 300 } = args;
      
      if (!namespace || !metricName || !dimensions) {
        throw new Error('Namespace, metric name, and dimensions are required');
      }

      logger.info(`Checking CloudWatch metrics for ${metricName} in namespace ${namespace}`);
      
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - (period * 1000));

      const params = {
        Namespace: namespace,
        MetricName: metricName,
        Dimensions: dimensions,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: ['Average', 'Maximum', 'Minimum']
      };

      const result = await this.cloudwatch.getMetricStatistics(params).promise();
      
      logger.info(`Retrieved ${result.Datapoints.length} datapoints for metric ${metricName}`);
      
      return {
        success: true,
        metricName,
        namespace,
        datapoints: result.Datapoints,
        statistics: result.Datapoints.length > 0 ? {
          average: result.Datapoints[0].Average,
          maximum: result.Datapoints[0].Maximum,
          minimum: result.Datapoints[0].Minimum
        } : null,
        message: `Retrieved ${result.Datapoints.length} datapoints for metric ${metricName}`
      };
    } catch (error) {
      logger.error('Failed to check CloudWatch metrics:', error.message);
      throw error;
    }
  }

  async performHealthCheck(args) {
    try {
      const { endpoint, expectedStatus = 200 } = args;
      
      if (!endpoint) {
        throw new Error('Endpoint is required');
      }

      logger.info(`Performing health check on endpoint: ${endpoint}`);
      
      const https = require('https');
      const url = require('url');
      
      return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(endpoint);
        
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.path,
          method: 'GET',
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            const isHealthy = res.statusCode === expectedStatus;
            logger.info(`Health check for ${endpoint}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'} (${res.statusCode})`);
            
            resolve({
              success: true,
              endpoint,
              statusCode: res.statusCode,
              isHealthy,
              responseTime: Date.now() - startTime,
              responseBody: data,
              message: `Health check completed for ${endpoint}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`
            });
          });
        });

        req.on('error', (error) => {
          logger.error(`Health check failed for ${endpoint}:`, error.message);
          reject(error);
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Health check timeout for ${endpoint}`));
        });

        const startTime = Date.now();
        req.end();
      });
    } catch (error) {
      logger.error('Failed to perform health check:', error.message);
      throw error;
    }
  }

  async verifyDeployment(args) {
    try {
      const { environment, applications } = args;
      
      if (!environment || !applications) {
        throw new Error('Environment and applications are required');
      }

      logger.info(`Starting deployment verification for ${environment} environment`);
      
      const verificationResults = {
        environment,
        timestamp: new Date().toISOString(),
        overallStatus: 'PENDING',
        checks: {}
      };

      // Verify EC2 instances if specified
      if (applications.ec2Clusters) {
        for (const cluster of applications.ec2Clusters) {
          verificationResults.checks[`ec2_${cluster}`] = await this.verifyEC2Instances({ clusterName: cluster });
        }
      }

      // Verify ECS services if specified
      if (applications.ecsClusters) {
        for (const cluster of applications.ecsClusters) {
          verificationResults.checks[`ecs_${cluster}`] = await this.verifyECSServices({ clusterName: cluster });
        }
      }

      // Verify load balancers if specified
      if (applications.loadBalancers) {
        verificationResults.checks.loadBalancers = await this.verifyLoadBalancers({ loadBalancerNames: applications.loadBalancers });
      }

      // Verify RDS instances if specified
      if (applications.rdsInstances) {
        verificationResults.checks.rdsInstances = await this.verifyRDSInstances({ dbInstanceIdentifiers: applications.rdsInstances });
      }

      // Verify Lambda functions if specified
      if (applications.lambdaFunctions) {
        verificationResults.checks.lambdaFunctions = await this.verifyLambdaFunctions({ functionNames: applications.lambdaFunctions });
      }

      // Perform health checks if endpoints specified
      if (applications.healthCheckEndpoints) {
        verificationResults.checks.healthChecks = await Promise.all(
          applications.healthCheckEndpoints.map(endpoint => this.performHealthCheck({ endpoint }))
        );
      }

      // Determine overall status
      const allChecks = Object.values(verificationResults.checks);
      const failedChecks = allChecks.filter(check => !check.success);
      
      verificationResults.overallStatus = failedChecks.length === 0 ? 'HEALTHY' : 'UNHEALTHY';
      verificationResults.failedChecks = failedChecks.length;

      logger.info(`Deployment verification completed. Overall status: ${verificationResults.overallStatus}`);
      
      return {
        success: true,
        verificationResults,
        message: `Deployment verification completed for ${environment}. Overall status: ${verificationResults.overallStatus}`
      };
    } catch (error) {
      logger.error('Failed to verify deployment:', error.message);
      throw error;
    }
  }

  async validateCredentials() {
    try {
      await this.ec2.describeRegions().promise();
      return {
        success: true,
        message: 'AWS credentials are valid'
      };
    } catch (error) {
      logger.error('AWS credentials validation failed:', error.message);
      return {
        success: false,
        message: 'AWS credentials validation failed',
        error: error.message
      };
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'aws',
      description: 'Verify and monitor AWS resources and deployments',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['verifyEC2Instances', 'verifyECSServices', 'verifyLoadBalancers', 'verifyRDSInstances', 'verifyLambdaFunctions', 'checkCloudWatchMetrics', 'performHealthCheck', 'verifyDeployment', 'validateCredentials'],
            description: 'The action to perform'
          },
          clusterName: {
            type: 'string',
            description: 'Name of the ECS/EC2 cluster'
          },
          loadBalancerNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of load balancer names'
          },
          dbInstanceIdentifiers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of RDS instance identifiers'
          },
          functionNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of Lambda function names'
          },
          namespace: {
            type: 'string',
            description: 'CloudWatch metric namespace'
          },
          metricName: {
            type: 'string',
            description: 'CloudWatch metric name'
          },
          dimensions: {
            type: 'array',
            description: 'CloudWatch metric dimensions'
          },
          period: {
            type: 'number',
            description: 'CloudWatch metric period in seconds'
          },
          endpoint: {
            type: 'string',
            description: 'Health check endpoint URL'
          },
          expectedStatus: {
            type: 'number',
            description: 'Expected HTTP status code for health check'
          },
          environment: {
            type: 'string',
            description: 'Target environment for verification'
          },
          applications: {
            type: 'object',
            description: 'Application configuration for verification'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'verifyEC2Instances':
        return await this.verifyEC2Instances(params);
      case 'verifyECSServices':
        return await this.verifyECSServices(params);
      case 'verifyLoadBalancers':
        return await this.verifyLoadBalancers(params);
      case 'verifyRDSInstances':
        return await this.verifyRDSInstances(params);
      case 'verifyLambdaFunctions':
        return await this.verifyLambdaFunctions(params);
      case 'checkCloudWatchMetrics':
        return await this.checkCloudWatchMetrics(params);
      case 'performHealthCheck':
        return await this.performHealthCheck(params);
      case 'verifyDeployment':
        return await this.verifyDeployment(params);
      case 'validateCredentials':
        return await this.validateCredentials();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = AWSTool;

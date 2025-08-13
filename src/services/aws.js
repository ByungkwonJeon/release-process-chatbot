const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

class AWSService {
  constructor() {
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
    
    // Additional services for comprehensive verification
    this.route53 = new AWS.Route53();
    this.iam = new AWS.IAM();
    this.secretsmanager = new AWS.SecretsManager();
    this.ssm = new AWS.SSM();
    this.dynamodb = new AWS.DynamoDB();
    this.sqs = new AWS.SQS();
    this.elasticache = new AWS.ElastiCache();
    this.acm = new AWS.ACM();
    this.ecr = new AWS.ECR();
    this.logs = new AWS.CloudWatchLogs();
  }

  // ===== ECS VERIFICATION =====
  async verifyECSServices(clusterName) {
    try {
      logger.info(`Verifying ECS services for cluster: ${clusterName}`);
      
      const services = await this.ecs.listServices({ cluster: clusterName }).promise();
      
      if (services.serviceArns.length === 0) {
        return {
          success: true,
          serviceCount: 0,
          services: []
        };
      }

      const serviceDetails = await this.ecs.describeServices({
        cluster: clusterName,
        services: services.serviceArns
      }).promise();

      const healthyServices = serviceDetails.services.filter(service => 
        service.desiredCount === service.runningCount && 
        service.desiredCount > 0
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
          status: service.status,
          taskDefinition: service.taskDefinition,
          loadBalancers: service.loadBalancers || []
        }))
      };
    } catch (error) {
      logger.error('Failed to verify ECS services:', error.message);
      throw error;
    }
  }

  async verifyECSTasks(clusterName, serviceName) {
    try {
      logger.info(`Verifying ECS tasks for service: ${serviceName} in cluster: ${clusterName}`);
      
      const tasks = await this.ecs.listTasks({
        cluster: clusterName,
        serviceName: serviceName
      }).promise();

      if (tasks.taskArns.length === 0) {
        return {
          success: true,
          taskCount: 0,
          tasks: []
        };
      }

      const taskDetails = await this.ecs.describeTasks({
        cluster: clusterName,
        tasks: tasks.taskArns
      }).promise();

      const runningTasks = taskDetails.tasks.filter(task => 
        task.lastStatus === 'RUNNING' && task.desiredStatus === 'RUNNING'
      );

      logger.info(`Found ${runningTasks.length} running ECS tasks for service ${serviceName}`);
      
      return {
        success: true,
        taskCount: runningTasks.length,
        totalTasks: taskDetails.tasks.length,
        tasks: runningTasks.map(task => ({
          taskArn: task.taskArn,
          taskDefinitionArn: task.taskDefinitionArn,
          lastStatus: task.lastStatus,
          desiredStatus: task.desiredStatus,
          healthStatus: task.healthStatus,
          containers: task.containers?.map(container => ({
            name: container.name,
            status: container.lastStatus,
            healthStatus: container.healthStatus
          })) || []
        }))
      };
    } catch (error) {
      logger.error('Failed to verify ECS tasks:', error.message);
      throw error;
    }
  }

  // ===== ROUTE53 VERIFICATION =====
  async verifyRoute53HostedZones(domainNames) {
    try {
      logger.info(`Verifying Route53 hosted zones for domains: ${domainNames.join(', ')}`);
      
      const hostedZones = await this.route53.listHostedZones().promise();
      
      const matchingZones = hostedZones.HostedZones.filter(zone => 
        domainNames.some(domain => zone.Name.includes(domain))
      );

      logger.info(`Found ${matchingZones.length} matching hosted zones`);
      
      return {
        success: true,
        zoneCount: matchingZones.length,
        zones: matchingZones.map(zone => ({
          id: zone.Id,
          name: zone.Name,
          resourceRecordSetCount: zone.ResourceRecordSetCount,
          config: zone.Config
        }))
      };
    } catch (error) {
      logger.error('Failed to verify Route53 hosted zones:', error.message);
      throw error;
    }
  }

  async verifyRoute53Records(hostedZoneId, recordNames) {
    try {
      logger.info(`Verifying Route53 records in hosted zone: ${hostedZoneId}`);
      
      const records = await this.route53.listResourceRecordSets({
        HostedZoneId: hostedZoneId
      }).promise();

      const matchingRecords = records.ResourceRecordSets.filter(record => 
        recordNames.some(name => record.Name.includes(name))
      );

      logger.info(`Found ${matchingRecords.length} matching records`);
      
      return {
        success: true,
        recordCount: matchingRecords.length,
        records: matchingRecords.map(record => ({
          name: record.Name,
          type: record.Type,
          ttl: record.TTL,
          resourceRecords: record.ResourceRecords,
          aliasTarget: record.AliasTarget
        }))
      };
    } catch (error) {
      logger.error('Failed to verify Route53 records:', error.message);
      throw error;
    }
  }

  // ===== LOAD BALANCER VERIFICATION =====
  async verifyLoadBalancers(loadBalancerNames) {
    try {
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
          dnsName: lb.DNSName,
          scheme: lb.Scheme,
          vpcId: lb.VpcId
        }))
      };
    } catch (error) {
      logger.error('Failed to verify load balancers:', error.message);
      throw error;
    }
  }

  async verifyTargetGroups(targetGroupNames) {
    try {
      logger.info(`Verifying target groups: ${targetGroupNames.join(', ')}`);
      
      const targetGroups = await this.elbv2.describeTargetGroups({
        Names: targetGroupNames
      }).promise();

      const healthyTargetGroups = targetGroups.TargetGroups.filter(tg => 
        tg.TargetType === 'ip' || tg.TargetType === 'instance'
      );

      logger.info(`Found ${healthyTargetGroups.length} healthy target groups`);
      
      return {
        success: true,
        targetGroupCount: healthyTargetGroups.length,
        targetGroups: healthyTargetGroups.map(tg => ({
          name: tg.TargetGroupName,
          arn: tg.TargetGroupArn,
          targetType: tg.TargetType,
          protocol: tg.Protocol,
          port: tg.Port,
          vpcId: tg.VpcId
        }))
      };
    } catch (error) {
      logger.error('Failed to verify target groups:', error.message);
      throw error;
    }
  }

  // ===== VPC VERIFICATION =====
  async verifyVPC(vpcId) {
    try {
      logger.info(`Verifying VPC: ${vpcId}`);
      
      const vpc = await this.ec2.describeVpcs({
        VpcIds: [vpcId]
      }).promise();

      if (vpc.Vpcs.length === 0) {
        throw new Error(`VPC ${vpcId} not found`);
      }

      const vpcInfo = vpc.Vpcs[0];
      
      // Get subnets
      const subnets = await this.ec2.describeSubnets({
        Filters: [{ Name: 'vpc-id', Values: [vpcId] }]
      }).promise();

      // Get security groups
      const securityGroups = await this.ec2.describeSecurityGroups({
        Filters: [{ Name: 'vpc-id', Values: [vpcId] }]
      }).promise();

      logger.info(`VPC ${vpcId} verification completed`);
      
      return {
        success: true,
        vpc: {
          vpcId: vpcInfo.VpcId,
          cidrBlock: vpcInfo.CidrBlock,
          state: vpcInfo.State,
          isDefault: vpcInfo.IsDefault,
          subnets: subnets.Subnets.map(subnet => ({
            subnetId: subnet.SubnetId,
            cidrBlock: subnet.CidrBlock,
            availabilityZone: subnet.AvailabilityZone,
            state: subnet.State
          })),
          securityGroups: securityGroups.SecurityGroups.map(sg => ({
            groupId: sg.GroupId,
            groupName: sg.GroupName,
            description: sg.Description
          }))
        }
      };
    } catch (error) {
      logger.error('Failed to verify VPC:', error.message);
      throw error;
    }
  }

  // ===== IAM VERIFICATION =====
  async verifyIAMRoles(roleNames) {
    try {
      logger.info(`Verifying IAM roles: ${roleNames.join(', ')}`);
      
      const roles = await Promise.all(
        roleNames.map(async (roleName) => {
          try {
            const role = await this.iam.getRole({ RoleName: roleName }).promise();
            return role.Role;
          } catch (error) {
            logger.warn(`Failed to get role ${roleName}:`, error.message);
            return null;
          }
        })
      );

      const validRoles = roles.filter(role => role !== null);

      logger.info(`Found ${validRoles.length} valid IAM roles`);
      
      return {
        success: true,
        roleCount: validRoles.length,
        roles: validRoles.map(role => ({
          roleName: role.RoleName,
          roleId: role.RoleId,
          arn: role.Arn,
          createDate: role.CreateDate,
          description: role.Description
        }))
      };
    } catch (error) {
      logger.error('Failed to verify IAM roles:', error.message);
      throw error;
    }
  }

  async verifyIAMPolicies(policyNames) {
    try {
      logger.info(`Verifying IAM policies: ${policyNames.join(', ')}`);
      
      const policies = await Promise.all(
        policyNames.map(async (policyName) => {
          try {
            const policy = await this.iam.getPolicy({ PolicyArn: policyName }).promise();
            return policy.Policy;
          } catch (error) {
            logger.warn(`Failed to get policy ${policyName}:`, error.message);
            return null;
          }
        })
      );

      const validPolicies = policies.filter(policy => policy !== null);

      logger.info(`Found ${validPolicies.length} valid IAM policies`);
      
      return {
        success: true,
        policyCount: validPolicies.length,
        policies: validPolicies.map(policy => ({
          policyName: policy.PolicyName,
          policyId: policy.PolicyId,
          arn: policy.Arn,
          createDate: policy.CreateDate,
          updateDate: policy.UpdateDate
        }))
      };
    } catch (error) {
      logger.error('Failed to verify IAM policies:', error.message);
      throw error;
    }
  }

  // ===== SECRETS MANAGER VERIFICATION =====
  async verifySecrets(secretNames) {
    try {
      logger.info(`Verifying Secrets Manager secrets: ${secretNames.join(', ')}`);
      
      const secrets = await Promise.all(
        secretNames.map(async (secretName) => {
          try {
            const secret = await this.secretsmanager.describeSecret({ SecretId: secretName }).promise();
            return secret;
          } catch (error) {
            logger.warn(`Failed to get secret ${secretName}:`, error.message);
            return null;
          }
        })
      );

      const validSecrets = secrets.filter(secret => secret !== null);

      logger.info(`Found ${validSecrets.length} valid secrets`);
      
      return {
        success: true,
        secretCount: validSecrets.length,
        secrets: validSecrets.map(secret => ({
          name: secret.Name,
          arn: secret.ARN,
          description: secret.Description,
          lastModifiedDate: secret.LastModifiedDate,
          secretType: secret.SecretType
        }))
      };
    } catch (error) {
      logger.error('Failed to verify secrets:', error.message);
      throw error;
    }
  }

  // ===== SYSTEMS MANAGER PARAMETER STORE VERIFICATION =====
  async verifyParameters(parameterNames) {
    try {
      logger.info(`Verifying Systems Manager parameters: ${parameterNames.join(', ')}`);
      
      const parameters = await Promise.all(
        parameterNames.map(async (parameterName) => {
          try {
            const parameter = await this.ssm.getParameter({ Name: parameterName }).promise();
            return parameter.Parameter;
          } catch (error) {
            logger.warn(`Failed to get parameter ${parameterName}:`, error.message);
            return null;
          }
        })
      );

      const validParameters = parameters.filter(param => param !== null);

      logger.info(`Found ${validParameters.length} valid parameters`);
      
      return {
        success: true,
        parameterCount: validParameters.length,
        parameters: validParameters.map(param => ({
          name: param.Name,
          type: param.Type,
          value: param.Value,
          lastModifiedDate: param.LastModifiedDate,
          version: param.Version
        }))
      };
    } catch (error) {
      logger.error('Failed to verify parameters:', error.message);
      throw error;
    }
  }

  // ===== DYNAMODB VERIFICATION =====
  async verifyDynamoDBTables(tableNames) {
    try {
      logger.info(`Verifying DynamoDB tables: ${tableNames.join(', ')}`);
      
      const tables = await Promise.all(
        tableNames.map(async (tableName) => {
          try {
            const table = await this.dynamodb.describeTable({ TableName: tableName }).promise();
            return table.Table;
          } catch (error) {
            logger.warn(`Failed to get table ${tableName}:`, error.message);
            return null;
          }
        })
      );

      const validTables = tables.filter(table => table !== null);

      logger.info(`Found ${validTables.length} valid DynamoDB tables`);
      
      return {
        success: true,
        tableCount: validTables.length,
        tables: validTables.map(table => ({
          tableName: table.TableName,
          tableStatus: table.TableStatus,
          itemCount: table.ItemCount,
          tableSizeBytes: table.TableSizeBytes,
          keySchema: table.KeySchema,
          billingMode: table.BillingModeSummary?.BillingMode
        }))
      };
    } catch (error) {
      logger.error('Failed to verify DynamoDB tables:', error.message);
      throw error;
    }
  }

  // ===== SQS VERIFICATION =====
  async verifySQSQueues(queueUrls) {
    try {
      logger.info(`Verifying SQS queues: ${queueUrls.join(', ')}`);
      
      const queues = await Promise.all(
        queueUrls.map(async (queueUrl) => {
          try {
            const attributes = await this.sqs.getQueueAttributes({
              QueueUrl: queueUrl,
              AttributeNames: ['All']
            }).promise();
            return { queueUrl, attributes: attributes.Attributes };
          } catch (error) {
            logger.warn(`Failed to get queue ${queueUrl}:`, error.message);
            return null;
          }
        })
      );

      const validQueues = queues.filter(queue => queue !== null);

      logger.info(`Found ${validQueues.length} valid SQS queues`);
      
      return {
        success: true,
        queueCount: validQueues.length,
        queues: validQueues.map(queue => ({
          queueUrl: queue.queueUrl,
          approximateNumberOfMessages: queue.attributes.ApproximateNumberOfMessages,
          approximateNumberOfMessagesNotVisible: queue.attributes.ApproximateNumberOfMessagesNotVisible,
          visibilityTimeout: queue.attributes.VisibilityTimeout,
          messageRetentionPeriod: queue.attributes.MessageRetentionPeriod
        }))
      };
    } catch (error) {
      logger.error('Failed to verify SQS queues:', error.message);
      throw error;
    }
  }

  // ===== ELASTICACHE VERIFICATION =====
  async verifyElastiCacheClusters(clusterNames) {
    try {
      logger.info(`Verifying ElastiCache clusters: ${clusterNames.join(', ')}`);
      
      const clusters = await this.elasticache.describeCacheClusters({
        CacheClusterIds: clusterNames
      }).promise();

      const availableClusters = clusters.CacheClusters.filter(cluster => 
        cluster.CacheClusterStatus === 'available'
      );

      logger.info(`Found ${availableClusters.length} available ElastiCache clusters`);
      
      return {
        success: true,
        clusterCount: availableClusters.length,
        clusters: availableClusters.map(cluster => ({
          cacheClusterId: cluster.CacheClusterId,
          engine: cluster.Engine,
          cacheClusterStatus: cluster.CacheClusterStatus,
          numCacheNodes: cluster.NumCacheNodes,
          cacheNodeType: cluster.CacheNodeType,
          endpoint: cluster.ConfigurationEndpoint?.Address
        }))
      };
    } catch (error) {
      logger.error('Failed to verify ElastiCache clusters:', error.message);
      throw error;
    }
  }

  // ===== ACM CERTIFICATES VERIFICATION =====
  async verifyCertificates(certificateArns) {
    try {
      logger.info(`Verifying ACM certificates: ${certificateArns.join(', ')}`);
      
      const certificates = await Promise.all(
        certificateArns.map(async (certArn) => {
          try {
            const cert = await this.acm.describeCertificate({ CertificateArn: certArn }).promise();
            return cert.Certificate;
          } catch (error) {
            logger.warn(`Failed to get certificate ${certArn}:`, error.message);
            return null;
          }
        })
      );

      const validCertificates = certificates.filter(cert => cert !== null);

      logger.info(`Found ${validCertificates.length} valid certificates`);
      
      return {
        success: true,
        certificateCount: validCertificates.length,
        certificates: validCertificates.map(cert => ({
          certificateArn: cert.CertificateArn,
          domainName: cert.DomainName,
          status: cert.Status,
          issuedAt: cert.IssuedAt,
          notAfter: cert.NotAfter,
          subjectAlternativeNames: cert.SubjectAlternativeNames
        }))
      };
    } catch (error) {
      logger.error('Failed to verify certificates:', error.message);
      throw error;
    }
  }

  // ===== SECURITY GROUPS VERIFICATION =====
  async verifySecurityGroups(securityGroupIds) {
    try {
      logger.info(`Verifying security groups: ${securityGroupIds.join(', ')}`);
      
      const securityGroups = await this.ec2.describeSecurityGroups({
        GroupIds: securityGroupIds
      }).promise();

      logger.info(`Found ${securityGroups.SecurityGroups.length} security groups`);
      
      return {
        success: true,
        securityGroupCount: securityGroups.SecurityGroups.length,
        securityGroups: securityGroups.SecurityGroups.map(sg => ({
          groupId: sg.GroupId,
          groupName: sg.GroupName,
          description: sg.Description,
          vpcId: sg.VpcId,
          inboundRules: sg.IpPermissions,
          outboundRules: sg.IpPermissionsEgress
        }))
      };
    } catch (error) {
      logger.error('Failed to verify security groups:', error.message);
      throw error;
    }
  }

  // ===== COMPREHENSIVE DEPLOYMENT VERIFICATION =====
  async verifyDeployment(environment, applications) {
    try {
      logger.info(`Starting comprehensive deployment verification for ${environment} environment`);
      
      const verificationResults = {
        environment,
        timestamp: new Date().toISOString(),
        overallStatus: 'PENDING',
        checks: {}
      };

      // Verify ECS services
      if (applications.ecsClusters) {
        for (const cluster of applications.ecsClusters) {
          verificationResults.checks[`ecs_${cluster}`] = await this.verifyECSServices(cluster);
        }
      }

      // Verify ECS tasks
      if (applications.ecsServices) {
        for (const service of applications.ecsServices) {
          verificationResults.checks[`ecs_tasks_${service.serviceName}`] = await this.verifyECSTasks(service.clusterName, service.serviceName);
        }
      }

      // Verify Route53
      if (applications.route53Domains) {
        verificationResults.checks.route53Zones = await this.verifyRoute53HostedZones(applications.route53Domains);
      }

      if (applications.route53Records) {
        verificationResults.checks.route53Records = await this.verifyRoute53Records(applications.route53Records.hostedZoneId, applications.route53Records.recordNames);
      }

      // Verify Load Balancers
      if (applications.loadBalancers) {
        verificationResults.checks.loadBalancers = await this.verifyLoadBalancers(applications.loadBalancers);
      }

      if (applications.targetGroups) {
        verificationResults.checks.targetGroups = await this.verifyTargetGroups(applications.targetGroups);
      }

      // Verify VPC
      if (applications.vpcId) {
        verificationResults.checks.vpc = await this.verifyVPC(applications.vpcId);
      }

      // Verify IAM
      if (applications.iamRoles) {
        verificationResults.checks.iamRoles = await this.verifyIAMRoles(applications.iamRoles);
      }

      if (applications.iamPolicies) {
        verificationResults.checks.iamPolicies = await this.verifyIAMPolicies(applications.iamPolicies);
      }

      // Verify Secrets Manager
      if (applications.secrets) {
        verificationResults.checks.secrets = await this.verifySecrets(applications.secrets);
      }

      // Verify Systems Manager Parameters
      if (applications.parameters) {
        verificationResults.checks.parameters = await this.verifyParameters(applications.parameters);
      }

      // Verify DynamoDB
      if (applications.dynamoDBTables) {
        verificationResults.checks.dynamoDB = await this.verifyDynamoDBTables(applications.dynamoDBTables);
      }

      // Verify SQS
      if (applications.sqsQueues) {
        verificationResults.checks.sqs = await this.verifySQSQueues(applications.sqsQueues);
      }

      // Verify ElastiCache
      if (applications.elasticacheClusters) {
        verificationResults.checks.elasticache = await this.verifyElastiCacheClusters(applications.elasticacheClusters);
      }

      // Verify Lambda
      if (applications.lambdaFunctions) {
        verificationResults.checks.lambda = await this.verifyLambdaFunctions(applications.lambdaFunctions);
      }

      // Verify Certificates
      if (applications.certificates) {
        verificationResults.checks.certificates = await this.verifyCertificates(applications.certificates);
      }

      // Verify Security Groups
      if (applications.securityGroups) {
        verificationResults.checks.securityGroups = await this.verifySecurityGroups(applications.securityGroups);
      }

      // Perform health checks
      if (applications.healthCheckEndpoints) {
        verificationResults.checks.healthChecks = await Promise.all(
          applications.healthCheckEndpoints.map(endpoint => this.performHealthCheck(endpoint))
        );
      }

      // Determine overall status
      const allChecks = Object.values(verificationResults.checks);
      const failedChecks = allChecks.filter(check => !check.success);
      
      verificationResults.overallStatus = failedChecks.length === 0 ? 'HEALTHY' : 'UNHEALTHY';
      verificationResults.failedChecks = failedChecks.length;
      verificationResults.totalChecks = allChecks.length;

      logger.info(`Comprehensive deployment verification completed. Overall status: ${verificationResults.overallStatus}`);
      
      return verificationResults;
    } catch (error) {
      logger.error('Failed to verify deployment:', error.message);
      throw error;
    }
  }

  // Keep existing methods for backward compatibility
  async verifyEC2Instances(clusterName) {
    try {
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
        }))
      };
    } catch (error) {
      logger.error('Failed to verify EC2 instances:', error.message);
      throw error;
    }
  }

  async verifyRDSInstances(dbInstanceIdentifiers) {
    try {
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
        }))
      };
    } catch (error) {
      logger.error('Failed to verify RDS instances:', error.message);
      throw error;
    }
  }

  async verifyLambdaFunctions(functionNames) {
    try {
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
        }))
      };
    } catch (error) {
      logger.error('Failed to verify Lambda functions:', error.message);
      throw error;
    }
  }

  async checkCloudWatchMetrics(namespace, metricName, dimensions, period = 300) {
    try {
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
        } : null
      };
    } catch (error) {
      logger.error('Failed to check CloudWatch metrics:', error.message);
      throw error;
    }
  }

  async performHealthCheck(endpoint, expectedStatus = 200) {
    try {
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
              responseBody: data
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

  async validateCredentials() {
    try {
      await this.ec2.describeRegions().promise();
      return true;
    } catch (error) {
      logger.error('AWS credentials validation failed:', error.message);
      return false;
    }
  }
}

module.exports = new AWSService();

module.exports = new AWSService();

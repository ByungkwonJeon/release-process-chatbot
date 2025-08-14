const { logger } = require('./logger');
const releaseWorkflow = require('../workflows/ReleaseWorkflow');
const { Release, Conversation } = require('../models/database');
const { 
  getAllEnvironments, 
  getEnvironmentConfig, 
  validateEnvironment,
  isActionAllowed,
  requiresApproval 
} = require('../config/environments');
const {
  getAllTerraformProjects,
  getTerraformProject,
  getTerraformProjectEnvironment,
  isTerraformActionAllowed,
  getProjectDependencies,
  validateProjectDependencies,
  getDeploymentOrder
} = require('../config/terraformProjects');

class ChatbotLogic {
  constructor() {
    this.commands = {
      startRelease: /start\s+(?:a\s+)?(?:new\s+)?release\s+(?:for\s+)?version\s+([\d.]+)/i,
      startReleaseWithEnv: /start\s+(?:a\s+)?(?:new\s+)?release\s+(?:for\s+)?version\s+([\d.]+)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      checkStatus: /(?:what'?s?\s+)?(?:the\s+)?status\s+(?:of\s+)?(?:the\s+)?(?:current\s+)?release/i,
      showLogs: /show\s+(?:me\s+)?(?:the\s+)?logs?\s+(?:for\s+)?(?:the\s+)?(.+)/i,
      deployServices: /deploy\s+(?:the\s+)?(.+?)\s+(?:to\s+)?(.+)/i,
      executeStep: /execute\s+(?:step\s+)?(.+)/i,
      help: /help|commands?|what\s+can\s+you\s+do/i,
      // Environment-specific commands
      listEnvironments: /list\s+(?:all\s+)?environments?/i,
      environmentInfo: /(?:show\s+)?(?:info\s+)?(?:for\s+)?environment\s+(local|dev|test|cat|prod)/i,
      // Enhanced Jira commands
      findReleaseCandidates: /find\s+(?:release\s+)?candidates?\s+(?:for\s+)?project\s+([A-Z]+)/i,
      createReleaseVersion: /create\s+(?:release\s+)?version\s+([\d.]+)\s+(?:for\s+)?project\s+([A-Z]+)/i,
      getDevInfo: /get\s+(?:development\s+)?info\s+(?:for\s+)?([A-Z]+-\d+)/i,
      searchIssues: /search\s+(?:for\s+)?(.+?)\s+(?:in\s+)?project\s+([A-Z]+)/i,
      createIssue: /create\s+(?:a\s+)?(?:new\s+)?(story|bug|task)\s+(?:for\s+)?(.+)/i,
      createJiraStory: /create\s+(?:a\s+)?(?:new\s+)?jira\s+(?:story|issue)\s+(?:in\s+)?project\s+([A-Z]+)\s+(?:with\s+)?(?:title\s+)?(.+?)(?:\s+with\s+(?:description\s+)?(.+))?(?:\s+assigned\s+to\s+(.+))?(?:\s+with\s+(?:priority\s+)?(high|medium|low))?(?:\s+in\s+(?:epic\s+)?(.+))?(?:\s+for\s+(?:sprint\s+)?(.+))?(?:\s+with\s+(?:labels?\s+)?(.+))?/i,
      createDetailedStory: /create\s+(?:a\s+)?(?:new\s+)?(?:detailed\s+)?story\s+(?:in\s+)?project\s+([A-Z]+)\s+(?:with\s+)?(?:title\s+)?(.+?)(?:\s+description\s+(.+?))?(?:\s+assignee\s+(.+?))?(?:\s+priority\s+(high|medium|low))?(?:\s+epic\s+(.+?))?(?:\s+sprint\s+(.+?))?(?:\s+labels?\s+(.+?))?(?:\s+components?\s+(.+?))?(?:\s+fixversion\s+(.+?))?/i,
      generateStoryContent: /generate\s+(?:story\s+)?content\s+(?:for\s+)?(?:title\s+)?(.+?)(?:\s+in\s+project\s+([A-Z]+))?(?:\s+with\s+(?:type\s+)?(story|bug|task))?(?:\s+epic\s+(.+?))?(?:\s+sprint\s+(.+?))?(?:\s+assignee\s+(.+?))?(?:\s+priority\s+(high|medium|low))?/i,
      // Sprint and story management commands
      getSprintStories: /(?:get|fetch|show)\s+(?:all\s+)?(?:stories?|issues?)\s+(?:from\s+)?(?:sprint\s+)?(\d+)/i,
      getSprintInfo: /(?:get|show)\s+(?:info\s+)?(?:for\s+)?(?:sprint\s+)?(\d+)/i,
      getActiveSprints: /(?:get|show|list)\s+(?:all\s+)?(?:active\s+)?sprints?\s+(?:for\s+)?(?:board\s+)?(\d+)?/i,
      generateReleaseNotes: /(?:generate|create)\s+(?:release\s+)?notes?\s+(?:for\s+)?(?:version\s+)?([\d.]+)\s+(?:from\s+)?(?:sprint\s+)?(\d+)/i,
      // Multi-project commands
      startMultiProjectRelease: /start\s+(?:a\s+)?(?:new\s+)?release\s+(?:for\s+)?version\s+([\d.]+)\s+(?:with\s+)?projects?\s+(.+)/i,
      listProjects: /list\s+(?:my\s+)?projects?/i,
      buildProject: /build\s+(?:project\s+)?(.+)/i,
      deployProject: /deploy\s+(?:project\s+)?(.+)\s+(?:to\s+)?(.+)/i,
      // Terraform-specific commands
      listTerraformProjects: /list\s+(?:all\s+)?(?:terraform\s+)?projects?/i,
      terraformProjectInfo: /(?:show\s+)?(?:info\s+)?(?:for\s+)?(?:terraform\s+)?project\s+(.+)/i,
      terraformInit: /(?:initialize|init)\s+(?:terraform\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      terraformPlan: /(?:plan|show\s+plan)\s+(?:terraform\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      terraformApply: /(?:apply|deploy)\s+(?:terraform\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      terraformValidate: /(?:validate|check)\s+(?:terraform\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      terraformOutput: /(?:get\s+)?(?:terraform\s+)?(?:output|outputs?)\s+(?:for\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      terraformState: /(?:show\s+)?(?:terraform\s+)?(?:state)\s+(?:for\s+)?(?:project\s+)?(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i,
      deployMultipleTerraform: /(?:deploy|apply)\s+(?:multiple\s+)?(?:terraform\s+)?projects?\s+(.+?)\s+(?:for\s+)?(local|dev|test|cat|prod)/i
    };

    // Define available projects with their configurations
    this.availableProjects = {
      'terraform-infra': {
        name: 'terraform-infra',
        type: 'terraform',
        repository: 'terraform-infrastructure',
        workspace: 'default',
        buildCommand: 'terraform init && terraform plan',
        deployCommand: 'terraform apply',
        description: 'Infrastructure as Code - Terraform configuration'
      },
      'spring-boot-api': {
        name: 'spring-boot-api',
        type: 'spring-boot',
        repository: 'spring-boot-api',
        buildCommand: './gradlew build',
        deployCommand: 'java -jar build/libs/api.jar',
        description: 'Spring Boot REST API'
      },
      'spring-boot-service': {
        name: 'spring-boot-service',
        type: 'spring-boot',
        repository: 'spring-boot-service',
        buildCommand: './gradlew build',
        deployCommand: 'java -jar build/libs/service.jar',
        description: 'Spring Boot Microservice'
      },
      'lambda-functions': {
        name: 'lambda-functions',
        type: 'lambda',
        repository: 'lambda-functions',
        buildCommand: 'sam build',
        deployCommand: 'sam deploy',
        description: 'AWS Lambda Functions'
      }
    };
  }

  async processMessage(message, sessionId) {
    try {
      logger.info(`Processing message: ${message} for session: ${sessionId}`);
      
      // Get or create conversation
      let conversation = await Conversation.findOne({
        where: { sessionId, isActive: true }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          sessionId,
          isActive: true
        });
      }

      // Update last activity using file database
      const { fileDatabase } = require('../models/database');
      conversation = await fileDatabase.updateConversation(conversation.id, {
        lastActivityAt: new Date().toISOString()
      });

      // Process the message
      const response = await this.analyzeMessage(message, conversation);
      
      return {
        success: true,
        response,
        conversationId: conversation.id
      };
    } catch (error) {
      logger.error('Failed to process message:', error.message);
      return {
        success: false,
        response: `Sorry, I encountered an error: ${error.message}`,
        error: error.message
      };
    }
  }

  async analyzeMessage(message, conversation) {
    const lowerMessage = message.toLowerCase();

    // Check for start release with environment command
    const startWithEnvMatch = message.match(this.commands.startReleaseWithEnv);
    if (startWithEnvMatch) {
      return await this.handleStartReleaseWithEnv(startWithEnvMatch[1], startWithEnvMatch[2], conversation);
    }

    // Check for start release command (default to dev)
    const startMatch = message.match(this.commands.startRelease);
    if (startMatch) {
      return await this.handleStartRelease(startMatch[1], conversation);
    }

    // Check for environment-specific commands
    const listEnvironmentsMatch = message.match(this.commands.listEnvironments);
    if (listEnvironmentsMatch) {
      return await this.handleListEnvironments(conversation);
    }

    const environmentInfoMatch = message.match(this.commands.environmentInfo);
    if (environmentInfoMatch) {
      return await this.handleEnvironmentInfo(environmentInfoMatch[1], conversation);
    }

    // Check for status command
    if (this.commands.checkStatus.test(message)) {
      return await this.handleCheckStatus(conversation);
    }

    // Check for logs command
    const logsMatch = message.match(this.commands.showLogs);
    if (logsMatch) {
      return await this.handleShowLogs(logsMatch[1], conversation);
    }

    // Check for deploy command
    const deployMatch = message.match(this.commands.deployServices);
    if (deployMatch) {
      return await this.handleDeployServices(deployMatch[1], deployMatch[2], conversation);
    }

    // Check for execute step command
    const stepMatch = message.match(this.commands.executeStep);
    if (stepMatch) {
      return await this.handleExecuteStep(stepMatch[1], conversation);
    }

    // Check for help command
    if (this.commands.help.test(message)) {
      return this.handleHelp();
    }

    // Check for enhanced Jira commands
    const candidatesMatch = message.match(this.commands.findReleaseCandidates);
    if (candidatesMatch) {
      return await this.handleFindReleaseCandidates(candidatesMatch[1], conversation);
    }

    const versionMatch = message.match(this.commands.createReleaseVersion);
    if (versionMatch) {
      return await this.handleCreateReleaseVersion(versionMatch[1], versionMatch[2], conversation);
    }

    const devInfoMatch = message.match(this.commands.getDevInfo);
    if (devInfoMatch) {
      return await this.handleGetDevInfo(devInfoMatch[1], conversation);
    }

    const searchMatch = message.match(this.commands.searchIssues);
    if (searchMatch) {
      return await this.handleSearchIssues(searchMatch[1], searchMatch[2], conversation);
    }

    const createIssueMatch = message.match(this.commands.createIssue);
    if (createIssueMatch) {
      return await this.handleCreateIssue(createIssueMatch[1], createIssueMatch[2], conversation);
    }

    const createJiraStoryMatch = message.match(this.commands.createJiraStory);
    if (createJiraStoryMatch) {
      return await this.handleCreateJiraStory(createJiraStoryMatch, conversation);
    }

    const createDetailedStoryMatch = message.match(this.commands.createDetailedStory);
    if (createDetailedStoryMatch) {
      return await this.handleCreateDetailedStory(createDetailedStoryMatch, conversation);
    }

    const generateStoryContentMatch = message.match(this.commands.generateStoryContent);
    if (generateStoryContentMatch) {
      return await this.handleGenerateStoryContent(generateStoryContentMatch, conversation);
    }

    // Check for sprint and story management commands
    const getSprintStoriesMatch = message.match(this.commands.getSprintStories);
    if (getSprintStoriesMatch) {
      return await this.handleGetSprintStories(getSprintStoriesMatch[1], conversation);
    }

    const getSprintInfoMatch = message.match(this.commands.getSprintInfo);
    if (getSprintInfoMatch) {
      return await this.handleGetSprintInfo(getSprintInfoMatch[1], conversation);
    }

    const getActiveSprintsMatch = message.match(this.commands.getActiveSprints);
    if (getActiveSprintsMatch) {
      return await this.handleGetActiveSprints(getActiveSprintsMatch[1], conversation);
    }

    const generateReleaseNotesMatch = message.match(this.commands.generateReleaseNotes);
    if (generateReleaseNotesMatch) {
      return await this.handleGenerateReleaseNotes(generateReleaseNotesMatch[1], generateReleaseNotesMatch[2], conversation);
    }

    // Check for multi-project commands
    const multiProjectMatch = message.match(this.commands.startMultiProjectRelease);
    if (multiProjectMatch) {
      return await this.handleStartMultiProjectRelease(multiProjectMatch[1], multiProjectMatch[2], conversation);
    }

    const listProjectsMatch = message.match(this.commands.listProjects);
    if (listProjectsMatch) {
      return this.handleListProjects();
    }

    const buildProjectMatch = message.match(this.commands.buildProject);
    if (buildProjectMatch) {
      return await this.handleBuildProject(buildProjectMatch[1], conversation);
    }

    const deployProjectMatch = message.match(this.commands.deployProject);
    if (deployProjectMatch) {
      return await this.handleDeployProject(deployProjectMatch[1], deployProjectMatch[2], conversation);
    }

    // Check for Terraform-specific commands
    const listTerraformProjectsMatch = message.match(this.commands.listTerraformProjects);
    if (listTerraformProjectsMatch) {
      return this.handleListTerraformProjects();
    }

    const terraformProjectInfoMatch = message.match(this.commands.terraformProjectInfo);
    if (terraformProjectInfoMatch) {
      return this.handleTerraformProjectInfo(terraformProjectInfoMatch[1]);
    }

    const terraformInitMatch = message.match(this.commands.terraformInit);
    if (terraformInitMatch) {
      return await this.handleTerraformInit(terraformInitMatch[1], terraformInitMatch[2], conversation);
    }

    const terraformPlanMatch = message.match(this.commands.terraformPlan);
    if (terraformPlanMatch) {
      return await this.handleTerraformPlan(terraformPlanMatch[1], terraformPlanMatch[2], conversation);
    }

    const terraformApplyMatch = message.match(this.commands.terraformApply);
    if (terraformApplyMatch) {
      return await this.handleTerraformApply(terraformApplyMatch[1], terraformApplyMatch[2], conversation);
    }

    const terraformValidateMatch = message.match(this.commands.terraformValidate);
    if (terraformValidateMatch) {
      return await this.handleTerraformValidate(terraformValidateMatch[1], terraformValidateMatch[2], conversation);
    }

    const terraformOutputMatch = message.match(this.commands.terraformOutput);
    if (terraformOutputMatch) {
      return await this.handleTerraformOutput(terraformOutputMatch[1], terraformOutputMatch[2], conversation);
    }

    const terraformStateMatch = message.match(this.commands.terraformState);
    if (terraformStateMatch) {
      return await this.handleTerraformState(terraformStateMatch[1], terraformStateMatch[2], conversation);
    }

    const deployMultipleTerraformMatch = message.match(this.commands.deployMultipleTerraform);
    if (deployMultipleTerraformMatch) {
      return await this.handleDeployMultipleTerraform(deployMultipleTerraformMatch[1], deployMultipleTerraformMatch[2], conversation);
    }

    // Default response for unrecognized commands
    return this.handleUnknownCommand(message);
  }

  async handleStartRelease(version, conversation) {
    try {
      logger.info(`Starting release for version: ${version}`);
      
      // Default applications - this would be configurable
      const applications = [
        { name: 'backend-api', type: 'spring-boot' },
        { name: 'frontend-app', type: 'react' },
        { name: 'notification-service', type: 'lambda' }
      ];

      // Default environment
      const environment = 'dev';

      // Create and start the release
      const release = await releaseWorkflow.createRelease(
        version,
        environment,
        applications
      );

      // Associate release with conversation
      const { fileDatabase } = require('../models/database');
      const updatedRelease = await fileDatabase.updateRelease(release.id, {
        conversationId: conversation.id
      });

      return {
        type: 'release_started',
        message: `🚀 I've started a new release for version ${version}! Here's what I'll do:\n\n` +
                `1. 🌿 Create release branch: release/v${version}\n` +
                `2. 📝 Generate release notes from Jira\n` +
                `3. 🏗️ Build infrastructure with Terraform\n` +
                `4. 🔨 Build services (Spring Boot, React, Lambda)\n` +
                `5. 🚀 Deploy to ${environment} via Spinnaker\n` +
                `6. ✅ Verify deployment and health checks\n\n` +
                `Release ID: ${release.id}\n` +
                `You can check the status anytime by asking "What's the status?"`,
        releaseId: release.id,
        version,
        environment
      };
    } catch (error) {
      logger.error('Failed to start release:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to start release for version ${version}: ${error.message}`
      };
    }
  }

  async handleCheckStatus(conversation) {
    try {
      // Get the latest release for this conversation
      const release = await Release.findOne({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC']]
      });

      if (!release) {
        return {
          type: 'no_release',
          message: "🤔 I don't see any active releases. You can start one by saying 'Start a new release for version X.X.X'"
        };
      }

      const status = await releaseWorkflow.getReleaseStatus(release.id);
      
      let statusMessage = `📊 **Release Status: ${release.version}**\n\n`;
      statusMessage += `Environment: ${release.environment}\n`;
      statusMessage += `Overall Status: ${release.status}\n\n`;
      
      statusMessage += `**Step Progress:**\n`;
      status.steps.forEach(step => {
        const stepName = this.getStepDisplayName(step.stepType);
        const statusIcon = this.getStatusIcon(step.status);
        statusMessage += `${statusIcon} ${stepName}: ${step.status}\n`;
      });

      return {
        type: 'status',
        message: statusMessage,
        releaseId: release.id,
        status: status
      };
    } catch (error) {
      logger.error('Failed to check status:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get release status: ${error.message}`
      };
    }
  }

  async handleShowLogs(logType, conversation) {
    try {
      const release = await Release.findOne({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC']]
      });

      if (!release) {
        return {
          type: 'no_release',
          message: "🤔 I don't see any active releases to show logs for."
        };
      }

      const logs = await releaseWorkflow.getReleaseLogs(release.id);
      
      if (logs.length === 0) {
        return {
          type: 'no_logs',
          message: "📝 No logs available yet for this release."
        };
      }

      let logMessage = `📝 **Recent Logs for Release ${release.version}**\n\n`;
      
      // Show last 10 logs
      const recentLogs = logs.slice(-10);
      recentLogs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const levelIcon = this.getLogLevelIcon(log.level);
        logMessage += `${levelIcon} [${timestamp}] ${log.message}\n`;
      });

      return {
        type: 'logs',
        message: logMessage,
        releaseId: release.id,
        logs: logs
      };
    } catch (error) {
      logger.error('Failed to show logs:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get logs: ${error.message}`
      };
    }
  }

  async handleDeployServices(serviceType, environment, conversation) {
    try {
      const release = await Release.findOne({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC']]
      });

      if (!release) {
        return {
          type: 'no_release',
          message: "🤔 I don't see any active releases. Please start a release first."
        };
      }

      // Execute the deploy services step
      await releaseWorkflow.executeStep(release.id, 'deploy_services', {
        targetEnvironment: environment,
        serviceType: serviceType
      });

      return {
        type: 'deployment_started',
        message: `🚀 Started deployment of ${serviceType} services to ${environment}!\n\n` +
                `I'll keep you updated on the progress. You can check the status anytime.`
      };
    } catch (error) {
      logger.error('Failed to deploy services:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to deploy services: ${error.message}`
      };
    }
  }

  async handleExecuteStep(stepName, conversation) {
    try {
      const release = await Release.findOne({
        where: { conversationId: conversation.id },
        order: [['createdAt', 'DESC']]
      });

      if (!release) {
        return {
          type: 'no_release',
          message: "🤔 I don't see any active releases. Please start a release first."
        };
      }

      // Map step names to step types
      const stepMapping = {
        'branch': 'create_branch',
        'release notes': 'generate_release_notes',
        'infrastructure': 'build_infrastructure',
        'services': 'build_services',
        'deploy infra': 'deploy_infrastructure',
        'deploy services': 'deploy_services',
        'verify': 'verify_deployment'
      };

      const stepType = stepMapping[stepName.toLowerCase()];
      if (!stepType) {
        return {
          type: 'error',
          message: `❌ Unknown step: ${stepName}. Available steps: ${Object.keys(stepMapping).join(', ')}`
        };
      }

      await releaseWorkflow.executeStep(release.id, stepType);

      return {
        type: 'step_executed',
        message: `✅ Successfully executed step: ${stepName}`
      };
    } catch (error) {
      logger.error('Failed to execute step:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to execute step: ${error.message}`
      };
    }
  }

  handleHelp() {
    return {
      type: 'help',
      message: `🤖 **Release Process Chatbot Commands**\n\n` +
              `🌍 **Environment Management:**\n` +
              `• "List environments" - See all available environments (local, dev, test, cat, prod)\n` +
              `• "Show info for environment prod" - Get detailed environment information\n` +
              `• "Start a new release for version 2.1.0 for dev" - Start release for specific environment\n\n` +
              `🚀 **Release Management:**\n` +
              `• "Start a new release for version 2.1.0" - Start with default projects (defaults to dev)\n` +
              `• "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api" - Multi-project release\n` +
              `• "What's the status?" - Check current release status\n` +
              `• "Show me the logs" - View release logs\n` +
              `• "Deploy backend services to dev" - Deploy specific services\n` +
              `• "Execute step 3" - Execute a specific release step\n\n` +
              `📋 **Multi-Project Management:**\n` +
              `• "List projects" - Show all available projects\n` +
              `• "Build project terraform-infra" - Build a specific project\n` +
              `• "Deploy project spring-boot-api to dev" - Deploy a specific project\n\n` +
                             `📊 **Enhanced Jira Features:**\n` +
               `• "Find release candidates for project PROJ" - Find issues ready for release\n` +
               `• "Create release version 2.1.0 for project PROJ" - Create Jira version\n` +
               `• "Get development info for PROJ-123" - Get commits, PRs, branches\n` +
               `• "Search for high priority bugs in project PROJ" - Search issues\n` +
               `• "Create a story for user authentication feature" - Create basic issues\n` +
               `• "Create jira story in project PROJ with title User authentication system" - Create detailed stories\n` +
               `• "Create detailed story in project PROJ with title Payment integration description Secure payment gateway assignee john.doe priority high epic Payment System sprint Sprint 123 labels payment,integration" - Create comprehensive stories\n` +
               `• "Generate story content for title User authentication system in project PROJ with type story epic User Management priority high" - Generate AI-powered descriptions and acceptance criteria with Copilot integration\n\n` +
               `📋 **Sprint & Story Management:**\n` +
               `• "Get stories from sprint 123" - Fetch all stories from a specific sprint\n` +
               `• "Get info for sprint 123" - Get detailed sprint information\n` +
               `• "Get active sprints" - List all active sprints\n` +
               `• "Get active sprints for board 456" - List sprints for specific board\n` +
               `• "Generate release notes for version 2.1.0 from sprint 123" - Generate release notes from sprint\n\n` +
              `💡 **Need help?** Try asking for specific commands or check the documentation.`
    };
  }

  // ===== ENVIRONMENT COMMAND HANDLERS =====

  async handleListEnvironments(conversation) {
    try {
      const environments = getAllEnvironments();
      
      let message = `🌍 **Available Environments:**\n\n`;
      
      environments.forEach(env => {
        const approvalStatus = env.requiresApproval ? '🔒 Requires Approval' : '✅ Auto Deploy';
        const autoDeployStatus = env.autoDeploy ? '🔄 Auto Deploy' : '⏸️ Manual Deploy';
        
        message += `**${env.displayName}** (${env.name})\n`;
        message += `📝 ${env.description}\n`;
        message += `🏗️ Terraform Workspace: ${env.terraformWorkspace}\n`;
        message += `🚀 Spinnaker Pipeline: ${env.spinnakerPipeline}\n`;
        message += `🌐 AWS Region: ${env.awsRegion}\n`;
        message += `🔐 ${approvalStatus} | ${autoDeployStatus}\n\n`;
      });
      
      message += `💡 **Usage Examples:**\n`;
      message += `• "Start a new release for version 2.1.0 for dev"\n`;
      message += `• "Show info for environment prod"\n`;
      message += `• "Deploy to test environment"\n`;
      
      return {
        type: 'environments',
        message,
        environments: environments.map(env => env.name)
      };
    } catch (error) {
      logger.error('Failed to list environments:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to list environments: ${error.message}`
      };
    }
  }

  async handleEnvironmentInfo(environmentName, conversation) {
    try {
      const env = getEnvironmentConfig(environmentName);
      
      let message = `🌍 **Environment: ${env.displayName}**\n\n`;
      message += `📝 **Description:** ${env.description}\n`;
      message += `🏗️ **Terraform Workspace:** ${env.terraformWorkspace}\n`;
      message += `📄 **Terraform Var File:** ${env.terraformVarFile}\n`;
      message += `🚀 **Spinnaker Pipeline:** ${env.spinnakerPipeline}\n`;
      message += `🌐 **AWS Region:** ${env.awsRegion}\n`;
      message += `👤 **AWS Profile:** ${env.awsProfile}\n`;
      message += `🖥️ **Jules Host:** ${env.julesHost}\n`;
      message += `👤 **Jules Username:** ${env.julesUsername}\n\n`;
      
      message += `🔐 **Security Settings:**\n`;
      message += `• Requires Approval: ${env.requiresApproval ? 'Yes' : 'No'}\n`;
      message += `• Auto Deploy: ${env.autoDeploy ? 'Yes' : 'No'}\n`;
      message += `• Allowed Actions: ${env.allowedActions.join(', ')}\n\n`;
      
      message += `🏥 **Health Check Endpoints:**\n`;
      env.healthCheckEndpoints.forEach(endpoint => {
        message += `• ${endpoint}\n`;
      });
      
      return {
        type: 'environment_info',
        message,
        environment: env
      };
    } catch (error) {
      logger.error('Failed to get environment info:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get environment info: ${error.message}`
      };
    }
  }

  async handleStartReleaseWithEnv(version, environmentName, conversation) {
    try {
      // Validate environment
      const env = getEnvironmentConfig(environmentName);
      
      // Check if environment requires approval
      if (env.requiresApproval) {
        return {
          type: 'approval_required',
          message: `🔒 **Approval Required for ${env.displayName}**\n\n` +
                   `This environment requires manual approval before deployment.\n` +
                   `Please contact your team lead or DevOps engineer to approve this release.\n\n` +
                   `**Release Details:**\n` +
                   `• Version: ${version}\n` +
                   `• Environment: ${env.displayName}\n` +
                   `• Terraform Workspace: ${env.terraformWorkspace}\n` +
                   `• Spinnaker Pipeline: ${env.spinnakerPipeline}`,
          version,
          environment: env
        };
      }
      
      // Default applications for the environment
      const applications = [
        'spring-boot-api',
        'spring-boot-service',
        'lambda-functions'
      ];
      
      // Create and start the release
      const release = await releaseWorkflow.createRelease(
        version,
        environmentName,
        applications
      );

      // Associate release with conversation
      const { fileDatabase } = require('../models/database');
      const updatedRelease = await fileDatabase.updateRelease(release.id, {
        conversationId: conversation.id
      });

      return {
        type: 'release_started',
        message: `🚀 I've started a new release for version ${version} in ${env.displayName}!\n\n` +
                `**Environment Details:**\n` +
                `• Environment: ${env.displayName}\n` +
                `• Terraform Workspace: ${env.terraformWorkspace}\n` +
                `• Spinnaker Pipeline: ${env.spinnakerPipeline}\n` +
                `• Auto Deploy: ${env.autoDeploy ? 'Yes' : 'No'}\n\n` +
                `**Release Steps:**\n` +
                `1. 🌿 Create release branch: release/v${version}\n` +
                `2. 📝 Generate release notes from Jira\n` +
                `3. 🏗️ Build infrastructure with Terraform\n` +
                `4. 🔨 Build services (Spring Boot, React, Lambda)\n` +
                `5. 🚀 Deploy to ${env.displayName} via Spinnaker\n` +
                `6. ✅ Verify deployment and health checks\n\n` +
                `Release ID: ${release.id}\n` +
                `You can check the status anytime by asking "What's the status?"`,
        releaseId: release.id,
        version,
        environment: env
      };
    } catch (error) {
      logger.error('Failed to start release with environment:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to start release for version ${version} in ${environmentName}: ${error.message}`
      };
    }
  }

  // ===== TERRAFORM PROJECT COMMAND HANDLERS =====

  handleListTerraformProjects() {
    try {
      const projects = getAllTerraformProjects();
      
      let message = `🏗️ **Available Terraform Projects:**\n\n`;
      
      projects.forEach(project => {
        message += `**${project.displayName}** (${project.name})\n`;
        message += `📝 ${project.description}\n`;
        message += `📦 Repository: ${project.repository}\n`;
        message += `⏱️ Estimated Duration: ${project.estimatedDuration}\n`;
        
        if (project.dependencies && project.dependencies.length > 0) {
          message += `🔗 Dependencies: ${project.dependencies.join(', ')}\n`;
        } else {
          message += `🔗 Dependencies: None\n`;
        }
        
        message += `🌍 Supported Environments: ${Object.keys(project.environments).join(', ')}\n\n`;
      });
      
      message += `💡 **Usage Examples:**\n`;
      message += `• "Show info for terraform project terraform-infra"\n`;
      message += `• "Initialize terraform project terraform-infra for dev"\n`;
      message += `• "Plan terraform project terraform-monitoring for test"\n`;
      message += `• "Apply terraform project terraform-security for prod"\n`;
      message += `• "Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"\n`;
      
      return {
        type: 'terraform_projects',
        message,
        projects: projects.map(p => p.name)
      };
    } catch (error) {
      logger.error('Failed to list Terraform projects:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to list Terraform projects: ${error.message}`
      };
    }
  }

  handleTerraformProjectInfo(projectName) {
    try {
      const project = getTerraformProject(projectName);
      
      let message = `🏗️ **Terraform Project: ${project.displayName}**\n\n`;
      message += `📝 **Description:** ${project.description}\n`;
      message += `📦 **Repository:** ${project.repository}\n`;
      message += `⏱️ **Estimated Duration:** ${project.estimatedDuration}\n`;
      
      if (project.dependencies && project.dependencies.length > 0) {
        message += `🔗 **Dependencies:** ${project.dependencies.join(', ')}\n`;
      } else {
        message += `🔗 **Dependencies:** None\n`;
      }
      
      message += `\n🌍 **Environment Configurations:**\n`;
      Object.entries(project.environments).forEach(([env, config]) => {
        message += `\n**${env.toUpperCase()} Environment:**\n`;
        message += `• Workspace: ${config.workspace}\n`;
        message += `• Variable File: ${config.varFile}\n`;
        message += `• Working Directory: ${config.workingDirectory}\n`;
        message += `• Allowed Actions: ${config.allowedActions.join(', ')}\n`;
      });
      
      return {
        type: 'terraform_project_info',
        message,
        project
      };
    } catch (error) {
      logger.error('Failed to get Terraform project info:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get Terraform project info: ${error.message}`
      };
    }
  }

  async handleTerraformInit(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'init')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform init is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('initializeTerraform', {
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_init_success',
        message: `✅ **Terraform Initialized Successfully**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n` +
                `**Working Directory:** ${envConfig.workingDirectory}\n\n` +
                `Terraform has been initialized and is ready for planning.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to initialize Terraform project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to initialize Terraform project '${projectName}' for ${environment}: ${error.message}`
      };
    }
  }

  async handleTerraformPlan(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'plan')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform plan is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('planInfrastructure', {
        environment,
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_plan_success',
        message: `📋 **Terraform Plan Generated**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n\n` +
                `Plan has been generated and saved. Review the changes before applying.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to plan Terraform project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to plan Terraform project '${projectName}' for ${environment}: ${error.message}`
      };
    }
  }

  async handleTerraformApply(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'apply')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform apply is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('applyInfrastructure', {
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_apply_success',
        message: `✅ **Terraform Infrastructure Applied**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n\n` +
                `Infrastructure has been successfully deployed.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to apply Terraform project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to apply Terraform project '${projectName}' for ${environment}: ${error.message}`
      };
    }
  }

  async handleTerraformValidate(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'validate')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform validate is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('validateTerraform', {
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_validate_success',
        message: `✅ **Terraform Configuration Validated**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n\n` +
                `Configuration is valid and ready for deployment.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to validate Terraform project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to validate Terraform project '${projectName}' for ${environment}: ${error.message}`
      };
    }
  }

  async handleTerraformOutput(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'output')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform output is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('getTerraformOutput', {
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_output_success',
        message: `📤 **Terraform Outputs**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n\n` +
                `Output values have been retrieved successfully.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to get Terraform output:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get Terraform output for project '${projectName}' in ${environment}: ${error.message}`
      };
    }
  }

  async handleTerraformState(projectName, environment, conversation) {
    try {
      const project = getTerraformProject(projectName);
      const envConfig = getTerraformProjectEnvironment(projectName, environment);
      
      if (!isTerraformActionAllowed(projectName, environment, 'state')) {
        return {
          type: 'action_not_allowed',
          message: `❌ Terraform state is not allowed for project '${project.displayName}' in ${environment} environment.`
        };
      }
      
      const mcpClient = require('../services/mcpClient');
      const result = await mcpClient.terraform('getTerraformState', {
        workingDirectory: envConfig.workingDirectory
      });
      
      return {
        type: 'terraform_state_success',
        message: `📊 **Terraform State**\n\n` +
                `**Project:** ${project.displayName}\n` +
                `**Environment:** ${environment}\n` +
                `**Workspace:** ${envConfig.workspace}\n\n` +
                `Current state has been retrieved successfully.`,
        project: project.name,
        environment,
        result
      };
    } catch (error) {
      logger.error('Failed to get Terraform state:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get Terraform state for project '${projectName}' in ${environment}: ${error.message}`
      };
    }
  }

  async handleDeployMultipleTerraform(projectNames, environment, conversation) {
    try {
      // Parse project names (comma-separated)
      const projects = projectNames.split(',').map(p => p.trim());
      
      // Validate projects and dependencies
      const validatedProjects = validateProjectDependencies(projects);
      const deploymentOrder = getDeploymentOrder(projects);
      
      let message = `🚀 **Deploying Multiple Terraform Projects**\n\n` +
                   `**Environment:** ${environment}\n` +
                   `**Projects:** ${projects.join(', ')}\n` +
                   `**Deployment Order:** ${deploymentOrder.join(' → ')}\n\n`;
      
      const results = [];
      
      for (const projectName of deploymentOrder) {
        const project = getTerraformProject(projectName);
        const envConfig = getTerraformProjectEnvironment(projectName, environment);
        
        message += `🏗️ **Deploying ${project.displayName}...**\n`;
        
        try {
          const mcpClient = require('../services/mcpClient');
          
          // Initialize
          await mcpClient.terraform('initializeTerraform', {
            workingDirectory: envConfig.workingDirectory
          });
          
          // Plan
          await mcpClient.terraform('planInfrastructure', {
            environment,
            workingDirectory: envConfig.workingDirectory
          });
          
          // Apply
          const result = await mcpClient.terraform('applyInfrastructure', {
            workingDirectory: envConfig.workingDirectory
          });
          
          message += `✅ ${project.displayName} deployed successfully\n`;
          results.push({ project: projectName, success: true, result });
          
        } catch (error) {
          message += `❌ ${project.displayName} deployment failed: ${error.message}\n`;
          results.push({ project: projectName, success: false, error: error.message });
          break; // Stop deployment on failure
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      message += `\n🎉 **Deployment Summary:** ${successCount}/${totalCount} projects deployed successfully`;
      
      return {
        type: 'multiple_terraform_deploy_success',
        message,
        environment,
        projects: validatedProjects,
        deploymentOrder,
        results
      };
    } catch (error) {
      logger.error('Failed to deploy multiple Terraform projects:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to deploy multiple Terraform projects: ${error.message}`
      };
    }
  }

  handleUnknownCommand(message) {
    return {
      type: 'unknown',
      message: `🤔 I'm not sure how to handle that command. Try asking for "help" to see what I can do, or try one of these:\n\n` +
               `• "Start a new release for version 2.1.0"\n` +
               `• "Start a new release for version 2.1.0 for dev"\n` +
               `• "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"\n` +
               `• "List environments" - See all available environments\n` +
               `• "Show info for environment prod"\n` +
               `• "List terraform projects" - See all Terraform projects\n` +
               `• "Initialize terraform project terraform-infra for dev"\n` +
               `• "Plan terraform project terraform-monitoring for test"\n` +
               `• "Apply terraform project terraform-security for prod"\n` +
               `• "Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"\n` +
               `• "What's the status?"\n` +
               `• "Find release candidates for project PROJ"\n` +
               `• "Get stories from sprint 123" - Fetch all stories from a specific sprint\n` +
               `• "Get active sprints" - List all active sprints\n` +
               `• "Generate release notes for version 2.1.0 from sprint 123" - Generate release notes from sprint\n` +
               `• "Create jira story in project PROJ with title User authentication system" - Create detailed stories`
    };
  }

  // ===== ENHANCED JIRA COMMAND HANDLERS =====

  async handleFindReleaseCandidates(projectKey, conversation) {
    try {
      logger.info(`Finding release candidates for project: ${projectKey}`);
      
      const mcpClient = require('../services/mcpClient');
      const candidates = await mcpClient.getReleaseCandidates(projectKey);
      
      let message = `📋 **Release Candidates for Project ${projectKey}**\n\n`;
      message += `Found ${candidates.totalIssues} issues ready for release:\n\n`;
      
      Object.entries(candidates.releaseCandidates).forEach(([component, issues]) => {
        message += `**${component}** (${issues.length} issues):\n`;
        issues.slice(0, 5).forEach(issue => {
          message += `• ${issue.key}: ${issue.summary}\n`;
        });
        if (issues.length > 5) {
          message += `• ... and ${issues.length - 5} more\n`;
        }
        message += '\n';
      });
      
      return {
        type: 'release_candidates',
        message,
        projectKey,
        candidates
      };
    } catch (error) {
      logger.error('Failed to find release candidates:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to find release candidates for project ${projectKey}: ${error.message}`
      };
    }
  }

  async handleCreateReleaseVersion(version, projectKey, conversation) {
    try {
      logger.info(`Creating release version ${version} for project: ${projectKey}`);
      
      const mcpClient = require('../services/mcpClient');
      const releaseVersion = await mcpClient.createReleaseVersion(
        projectKey,
        version,
        `Release ${version} created via chatbot`
      );
      
      const message = `✅ **Release Version Created**\n\n` +
                     `**Version:** ${releaseVersion.version.name}\n` +
                     `**Project:** ${projectKey}\n` +
                     `**Description:** ${releaseVersion.version.description}\n` +
                     `**ID:** ${releaseVersion.version.id}`;
      
      return {
        type: 'release_version_created',
        message,
        projectKey,
        version,
        releaseVersion
      };
    } catch (error) {
      logger.error('Failed to create release version:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to create release version ${version} for project ${projectKey}: ${error.message}`
      };
    }
  }

  async handleGetDevInfo(issueKey, conversation) {
    try {
      logger.info(`Getting development info for issue: ${issueKey}`);
      
      const mcpClient = require('../services/mcpClient');
      const devInfo = await mcpClient.getDevInfo(issueKey);
      
      let message = `🔧 **Development Info for ${issueKey}**\n\n`;
      
      if (devInfo.devInfo.pullRequests.length > 0) {
        message += `**Pull Requests:** ${devInfo.devInfo.pullRequests.length}\n`;
        devInfo.devInfo.pullRequests.slice(0, 3).forEach(pr => {
          message += `• ${pr.title || 'Untitled PR'}\n`;
        });
        message += '\n';
      }
      
      if (devInfo.devInfo.commits.length > 0) {
        message += `**Commits:** ${devInfo.devInfo.commits.length}\n`;
        devInfo.devInfo.commits.slice(0, 3).forEach(commit => {
          message += `• ${commit.message || 'No message'}\n`;
        });
        message += '\n';
      }
      
      if (devInfo.devInfo.branches.length > 0) {
        message += `**Branches:** ${devInfo.devInfo.branches.length}\n`;
        devInfo.devInfo.branches.slice(0, 3).forEach(branch => {
          message += `• ${branch.name || 'Unknown branch'}\n`;
        });
        message += '\n';
      }
      
      if (devInfo.devInfo.pullRequests.length === 0 && 
          devInfo.devInfo.commits.length === 0 && 
          devInfo.devInfo.branches.length === 0) {
        message += `No development information available for ${issueKey}`;
      }
      
      return {
        type: 'dev_info',
        message,
        issueKey,
        devInfo
      };
    } catch (error) {
      logger.error('Failed to get development info:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get development info for ${issueKey}: ${error.message}`
      };
    }
  }

  async handleSearchIssues(searchTerm, projectKey, conversation) {
    try {
      logger.info(`Searching for "${searchTerm}" in project: ${projectKey}`);
      
      const mcpClient = require('../services/mcpClient');
      
      // Build JQL query based on search term
      let jql = `project = ${projectKey}`;
      
      if (searchTerm.toLowerCase().includes('bug')) {
        jql += ` AND issuetype = Bug`;
      } else if (searchTerm.toLowerCase().includes('story')) {
        jql += ` AND issuetype = Story`;
      } else if (searchTerm.toLowerCase().includes('high priority')) {
        jql += ` AND priority = High`;
      } else if (searchTerm.toLowerCase().includes('done')) {
        jql += ` AND status = Done`;
      } else {
        jql += ` AND summary ~ "${searchTerm}"`;
      }
      
      jql += ` ORDER BY priority DESC, created DESC`;
      
      const searchResult = await mcpClient.searchIssues(jql, 10);
      
      let message = `🔍 **Search Results for "${searchTerm}" in ${projectKey}**\n\n`;
      message += `Found ${searchResult.total} issues:\n\n`;
      
      searchResult.issues.slice(0, 5).forEach(issue => {
        const statusIcon = issue.status === 'Done' ? '✅' : 
                          issue.status === 'In Progress' ? '🔄' : '📋';
        message += `${statusIcon} **${issue.key}**: ${issue.summary}\n`;
        message += `   Status: ${issue.status} | Priority: ${issue.priority} | Type: ${issue.type}\n\n`;
      });
      
      if (searchResult.total > 5) {
        message += `... and ${searchResult.total - 5} more issues`;
      }
      
      return {
        type: 'search_results',
        message,
        projectKey,
        searchTerm,
        searchResult
      };
    } catch (error) {
      logger.error('Failed to search issues:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to search for "${searchTerm}" in project ${projectKey}: ${error.message}`
      };
    }
  }

  async handleCreateIssue(issueType, description, conversation) {
    try {
      logger.info(`Creating ${issueType} issue: ${description}`);
      
      const mcpClient = require('../services/mcpClient');
      
      // Extract project key from description or use default
      const projectMatch = description.match(/([A-Z]+)/);
      const projectKey = projectMatch ? projectMatch[1] : 'PROJ';
      
      // Clean up description
      const cleanDescription = description.replace(/([A-Z]+)/, '').trim();
      
      const newIssue = await mcpClient.createIssue(
        projectKey,
        cleanDescription,
        `Issue created via chatbot: ${cleanDescription}`,
        issueType.charAt(0).toUpperCase() + issueType.slice(1)
      );
      
      const message = `✅ **New ${issueType.toUpperCase()} Created**\n\n` +
                     `**Issue Key:** ${newIssue.issue.key}\n` +
                     `**Summary:** ${newIssue.issue.summary}\n` +
                     `**Project:** ${projectKey}\n` +
                     `**Type:** ${newIssue.issue.issueType}`;
      
      return {
        type: 'issue_created',
        message,
        issueType,
        description,
        newIssue
      };
    } catch (error) {
      logger.error('Failed to create issue:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to create ${issueType} issue: ${error.message}`
      };
    }
  }

  async handleCreateJiraStory(match, conversation) {
    try {
      const [, projectKey, title, description, assignee, priority, epic, sprint, labels] = match;
      
      logger.info(`Creating Jira story in project ${projectKey}: ${title}`);
      
      const mcpClient = require('../services/mcpClient');
      
      // Prepare issue data
      const issueData = {
        projectKey,
        summary: title,
        description: description || `Story created via chatbot: ${title}`,
        issueType: 'Story',
        assignee: assignee || null,
        priority: priority || 'Medium',
        epic: epic || null,
        sprint: sprint || null,
        labels: labels ? labels.split(',').map(l => l.trim()) : []
      };
      
      const newIssue = await mcpClient.enhancedJira('createDetailedIssue', issueData);
      
      const message = `✅ **New Jira Story Created**\n\n` +
                     `**Issue Key:** ${newIssue.issue.key}\n` +
                     `**Summary:** ${newIssue.issue.summary}\n` +
                     `**Project:** ${projectKey}\n` +
                     `**Type:** Story\n` +
                     `**Priority:** ${priority || 'Medium'}\n` +
                     `**Assignee:** ${assignee || 'Unassigned'}\n` +
                     `**Epic:** ${epic || 'None'}\n` +
                     `**Sprint:** ${sprint || 'None'}\n` +
                     `**Labels:** ${labels || 'None'}`;
      
      return {
        type: 'jira_story_created',
        message,
        projectKey,
        title,
        newIssue
      };
    } catch (error) {
      logger.error('Failed to create Jira story:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to create Jira story: ${error.message}`
      };
    }
  }

  async handleCreateDetailedStory(match, conversation) {
    try {
      const [, projectKey, title, description, assignee, priority, epic, sprint, labels, components, fixVersion] = match;
      
      logger.info(`Creating detailed story in project ${projectKey}: ${title}`);
      
      const mcpClient = require('../services/mcpClient');
      
      // Prepare comprehensive issue data
      const issueData = {
        projectKey,
        summary: title,
        description: description || `Detailed story created via chatbot: ${title}`,
        issueType: 'Story',
        assignee: assignee || null,
        priority: priority || 'Medium',
        epic: epic || null,
        sprint: sprint || null,
        labels: labels ? labels.split(',').map(l => l.trim()) : [],
        components: components ? components.split(',').map(c => c.trim()) : [],
        fixVersions: fixVersion ? [fixVersion] : []
      };
      
      const newIssue = await mcpClient.enhancedJira('createDetailedIssue', issueData);
      
      const message = `✅ **New Detailed Story Created**\n\n` +
                     `**Issue Key:** ${newIssue.issue.key}\n` +
                     `**Summary:** ${newIssue.issue.summary}\n` +
                     `**Project:** ${projectKey}\n` +
                     `**Type:** Story\n` +
                     `**Priority:** ${priority || 'Medium'}\n` +
                     `**Assignee:** ${assignee || 'Unassigned'}\n` +
                     `**Epic:** ${epic || 'None'}\n` +
                     `**Sprint:** ${sprint || 'None'}\n` +
                     `**Labels:** ${labels || 'None'}\n` +
                     `**Components:** ${components || 'None'}\n` +
                     `**Fix Version:** ${fixVersion || 'None'}`;
      
      return {
        type: 'detailed_story_created',
        message,
        projectKey,
        title,
        newIssue
      };
    } catch (error) {
      logger.error('Failed to create detailed story:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to create detailed story: ${error.message}`
      };
    }
  }

  async handleGetSprintStories(sprintId, conversation) {
    try {
      logger.info(`Getting stories from sprint ${sprintId}`);
      
      const mcpClient = require('../services/mcpClient');
      
      const stories = await mcpClient.enhancedJira('getSprintStories', { sprintId });
      
      const message = `📋 **Stories from Sprint ${sprintId}**\n\n` +
                     `**Total Stories:** ${stories.length}\n\n` +
                     stories.map(story => 
                       `• **${story.key}** - ${story.summary}\n` +
                       `  Status: ${story.status}, Priority: ${story.priority || 'None'}\n` +
                       `  Assignee: ${story.assignee || 'Unassigned'}\n` +
                       `  Type: ${story.type}\n`
                     ).join('\n');
      
      return {
        type: 'sprint_stories',
        message,
        sprintId,
        stories
      };
    } catch (error) {
      logger.error('Failed to get sprint stories:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get stories from sprint ${sprintId}: ${error.message}`
      };
    }
  }

  async handleGetSprintInfo(sprintId, conversation) {
    try {
      logger.info(`Getting info for sprint ${sprintId}`);
      
      const mcpClient = require('../services/mcpClient');
      
      const sprintInfo = await mcpClient.enhancedJira('getActiveSprints', { boardId: null });
      const sprint = sprintInfo.find(s => s.id == sprintId);
      
      if (!sprint) {
        return {
          type: 'error',
          message: `❌ Sprint ${sprintId} not found`
        };
      }
      
      const message = `📅 **Sprint Information**\n\n` +
                     `**Sprint ID:** ${sprint.id}\n` +
                     `**Name:** ${sprint.name}\n` +
                     `**State:** ${sprint.state}\n` +
                     `**Start Date:** ${sprint.startDate || 'Not set'}\n` +
                     `**End Date:** ${sprint.endDate || 'Not set'}\n` +
                     `**Goal:** ${sprint.goal || 'No goal set'}`;
      
      return {
        type: 'sprint_info',
        message,
        sprintId,
        sprint
      };
    } catch (error) {
      logger.error('Failed to get sprint info:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get sprint info: ${error.message}`
      };
    }
  }

  async handleGetActiveSprints(boardId, conversation) {
    try {
      logger.info(`Getting active sprints${boardId ? ` for board ${boardId}` : ''}`);
      
      const mcpClient = require('../services/mcpClient');
      
      const sprints = await mcpClient.enhancedJira('getActiveSprints', { boardId });
      
      const message = `🏃 **Active Sprints**\n\n` +
                     sprints.map(sprint => 
                       `• **${sprint.name}** (ID: ${sprint.id})\n` +
                       `  State: ${sprint.state}\n` +
                       `  Start: ${sprint.startDate || 'Not set'}\n` +
                       `  End: ${sprint.endDate || 'Not set'}\n`
                     ).join('\n');
      
      return {
        type: 'active_sprints',
        message,
        boardId,
        sprints
      };
    } catch (error) {
      logger.error('Failed to get active sprints:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to get active sprints: ${error.message}`
      };
    }
  }

  async handleGenerateReleaseNotes(version, sprintId, conversation) {
    try {
      logger.info(`Generating release notes for version ${version} from sprint ${sprintId}`);
      
      const mcpClient = require('../services/mcpClient');
      
      const releaseNotes = await mcpClient.enhancedJira('generateReleaseNotes', { 
        version, 
        sprintId
      });
      
      const message = `📝 **Release Notes for Version ${version}**\n\n` +
                     `**Generated from Sprint:** ${sprintId}\n` +
                     `**Release Date:** ${new Date().toLocaleDateString()}\n\n` +
                     releaseNotes.releaseNotes;
      
      return {
        type: 'release_notes_generated',
        message,
        version,
        sprintId,
        releaseNotes
      };
    } catch (error) {
      logger.error('Failed to generate release notes:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to generate release notes: ${error.message}`
      };
    }
  }

  async handleGenerateStoryContent(match, conversation) {
    try {
      const [, title, projectKey, issueType, epic, sprint, assignee, priority] = match;
      
      logger.info(`Generating story content for: ${title}`);
      
      const mcpClient = require('../services/mcpClient');
      
      const contentResult = await mcpClient.enhancedJira('generateStoryContent', {
        title,
        projectKey: projectKey || 'PROJ',
        issueType: issueType || 'Story',
        epic: epic || null,
        sprint: sprint || null,
        assignee: assignee || null,
        priority: priority || 'Medium'
      });
      
      const { description, acceptanceCriteria, copilotSuggestions } = contentResult.content;
      
      let message = `📝 **Generated Story Content**\n\n` +
                   `**Title:** ${title}\n` +
                   `**Project:** ${projectKey || 'PROJ'}\n` +
                   `**Type:** ${issueType || 'Story'}\n` +
                   `**Priority:** ${priority || 'Medium'}\n\n`;
      
      message += `## 📋 **Description**\n\n${description}\n\n`;
      message += `## ✅ **Acceptance Criteria**\n\n${acceptanceCriteria}\n\n`;
      
      message += `## 🤖 **GitHub Copilot Integration**\n\n`;
      message += `**VS Code Commands:**\n`;
      copilotSuggestions.vscodeCommands.forEach(cmd => {
        message += `• ${cmd}\n`;
      });
      
      message += `\n**Copilot Prompts:**\n`;
      copilotSuggestions.copilotPrompts.forEach(prompt => {
        message += `• "${prompt}"\n`;
      });
      
      message += `\n**VS Code Integration Steps:**\n`;
      message += `**For Description:**\n${copilotSuggestions.vscodeIntegration.description}\n\n`;
      message += `**For Acceptance Criteria:**\n${copilotSuggestions.vscodeIntegration.acceptanceCriteria}`;
      
      return {
        type: 'story_content_generated',
        message,
        title,
        content: contentResult.content
      };
    } catch (error) {
      logger.error('Failed to generate story content:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to generate story content: ${error.message}`
      };
    }
  }

  // ===== MULTI-PROJECT COMMAND HANDLERS =====

  handleListProjects() {
    let message = `📋 **Available Projects**\n\n`;
    
    Object.entries(this.availableProjects).forEach(([key, project]) => {
      message += `**${project.name}** (${project.type})\n`;
      message += `Repository: ${project.repository}\n`;
      message += `Description: ${project.description}\n`;
      message += `Build: \`${project.buildCommand}\`\n`;
      message += `Deploy: \`${project.deployCommand}\`\n\n`;
    });
    
    message += `💡 **Usage Examples:**\n`;
    message += `• "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"\n`;
    message += `• "Build project terraform-infra"\n`;
    message += `• "Deploy project spring-boot-api to staging"\n`;
    
    return {
      type: 'projects_listed',
      message,
      projects: this.availableProjects
    };
  }

  async handleStartMultiProjectRelease(version, projectNames, conversation) {
    try {
      logger.info(`Starting multi-project release for version: ${version} with projects: ${projectNames}`);
      
      // Parse project names (comma-separated)
      const requestedProjects = projectNames.split(',').map(p => p.trim().toLowerCase());
      
      // Validate and get project configurations
      const selectedProjects = [];
      const invalidProjects = [];
      
      requestedProjects.forEach(projectName => {
        if (this.availableProjects[projectName]) {
          selectedProjects.push(this.availableProjects[projectName]);
        } else {
          invalidProjects.push(projectName);
        }
      });
      
      if (invalidProjects.length > 0) {
        return {
          type: 'error',
          message: `❌ Invalid projects: ${invalidProjects.join(', ')}\n\nUse "list projects" to see available projects.`
        };
      }
      
      if (selectedProjects.length === 0) {
        return {
          type: 'error',
          message: `❌ No valid projects specified. Use "list projects" to see available projects.`
        };
      }
      
      // Create applications array for the workflow
      const applications = selectedProjects.map(project => ({
        name: project.name,
        type: project.type,
        repository: project.repository,
        buildCommand: project.buildCommand,
        deployCommand: project.deployCommand
      }));
      
      // Default environment
      const environment = 'dev';
      
      // Create and start the release
      const release = await releaseWorkflow.createRelease(
        version,
        environment,
        applications
      );
      
      // Associate release with conversation
      const { fileDatabase } = require('../models/database');
      const updatedRelease = await fileDatabase.updateRelease(release.id, {
        conversationId: conversation.id
      });
      
      let message = `🚀 **Multi-Project Release Started!**\n\n`;
      message += `**Version:** ${version}\n`;
      message += `**Environment:** ${environment}\n`;
      message += `**Projects:** ${selectedProjects.length}\n\n`;
      
      selectedProjects.forEach(project => {
        message += `• **${project.name}** (${project.type})\n`;
        message += `  Repository: ${project.repository}\n`;
      });
      
      message += `\n**Release Workflow:**\n`;
      message += `1. 🌿 Create release branches for all projects\n`;
      message += `2. 📝 Generate release notes from Jira\n`;
      message += `3. 🏗️ Build infrastructure (Terraform)\n`;
      message += `4. 🔨 Build all services (Spring Boot, Lambda)\n`;
      message += `5. 🚀 Deploy to ${environment} via Spinnaker\n`;
      message += `6. ✅ Verify deployment and health checks\n\n`;
      message += `**Release ID:** ${release.id}\n`;
      message += `Check status anytime with "What's the status?"`;
      
      return {
        type: 'multi_project_release_started',
        message,
        releaseId: release.id,
        version,
        environment,
        projects: selectedProjects
      };
    } catch (error) {
      logger.error('Failed to start multi-project release:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to start multi-project release for version ${version}: ${error.message}`
      };
    }
  }

  async handleBuildProject(projectName, conversation) {
    try {
      const projectKey = projectName.toLowerCase();
      
      if (!this.availableProjects[projectKey]) {
        return {
          type: 'error',
          message: `❌ Project "${projectName}" not found. Use "list projects" to see available projects.`
        };
      }
      
      const project = this.availableProjects[projectKey];
      logger.info(`Building project: ${project.name}`);
      
      // Simulate build process (this would integrate with your actual build system)
      const buildResult = {
        project: project.name,
        type: project.type,
        buildCommand: project.buildCommand,
        status: 'completed',
        buildId: `build-${project.name}-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      let message = `🔨 **Project Build Completed**\n\n`;
      message += `**Project:** ${project.name}\n`;
      message += `**Type:** ${project.type}\n`;
      message += `**Repository:** ${project.repository}\n`;
      message += `**Build ID:** ${buildResult.buildId}\n`;
      message += `**Status:** ✅ Completed\n`;
      message += `**Command:** \`${project.buildCommand}\``;
      
      return {
        type: 'project_built',
        message,
        project: project,
        buildResult
      };
    } catch (error) {
      logger.error('Failed to build project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to build project ${projectName}: ${error.message}`
      };
    }
  }

  async handleDeployProject(projectName, environment, conversation) {
    try {
      const projectKey = projectName.toLowerCase();
      
      if (!this.availableProjects[projectKey]) {
        return {
          type: 'error',
          message: `❌ Project "${projectName}" not found. Use "list projects" to see available projects.`
        };
      }
      
      const project = this.availableProjects[projectKey];
      logger.info(`Deploying project: ${project.name} to ${environment}`);
      
      // Simulate deployment process (this would integrate with Spinnaker)
      const deployResult = {
        project: project.name,
        type: project.type,
        environment: environment,
        deployCommand: project.deployCommand,
        status: 'completed',
        deploymentId: `deploy-${project.name}-${environment}-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      let message = `🚀 **Project Deployment Completed**\n\n`;
      message += `**Project:** ${project.name}\n`;
      message += `**Type:** ${project.type}\n`;
      message += `**Environment:** ${environment}\n`;
      message += `**Repository:** ${project.repository}\n`;
      message += `**Deployment ID:** ${deployResult.deploymentId}\n`;
      message += `**Status:** ✅ Completed\n`;
      message += `**Command:** \`${project.deployCommand}\``;
      
      return {
        type: 'project_deployed',
        message,
        project: project,
        environment,
        deployResult
      };
    } catch (error) {
      logger.error('Failed to deploy project:', error.message);
      return {
        type: 'error',
        message: `❌ Failed to deploy project ${projectName} to ${environment}: ${error.message}`
      };
    }
  }

  getStepDisplayName(stepType) {
    const stepNames = {
      'create_branch': 'Create Release Branch',
      'generate_release_notes': 'Generate Release Notes',
      'build_infrastructure': 'Build Infrastructure',
      'build_services': 'Build Services',
      'deploy_infrastructure': 'Deploy Infrastructure',
      'deploy_services': 'Deploy Services',
      'verify_deployment': 'Verify Deployment'
    };
    return stepNames[stepType] || stepType;
  }

  getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'in_progress': '🔄',
      'completed': '✅',
      'failed': '❌',
      'skipped': '⏭️'
    };
    return icons[status] || '❓';
  }

  getLogLevelIcon(level) {
    const icons = {
      'debug': '🔍',
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌'
    };
    return icons[level] || 'ℹ️';
  }
}

module.exports = new ChatbotLogic();

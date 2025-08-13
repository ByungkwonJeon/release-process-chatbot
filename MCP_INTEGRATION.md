# Model Context Protocol (MCP) Integration

## Overview

This release process chatbot now uses the **Model Context Protocol (MCP)** for all external tool integrations. MCP provides a standardized way to interact with external tools and services, making the system more modular, extensible, and maintainable.

## What is Model Context Protocol?

The Model Context Protocol is an open standard that enables AI assistants to interact with external tools and data sources through a standardized interface. It provides:

- **Standardized Tool Interface**: All tools follow the same API pattern
- **Dynamic Tool Discovery**: Tools can be discovered and used at runtime
- **Extensible Architecture**: Easy to add new tools and capabilities
- **Type Safety**: Strong typing for tool inputs and outputs
- **Error Handling**: Consistent error handling across all tools

## MCP Architecture

### Components

1. **MCP Server** (`src/mcp/server.js`)
   - Runs on port 3002 by default
   - Manages all tool registrations
   - Handles tool discovery and execution

2. **MCP Tools** (`src/mcp/tools/`)
   - Individual tool implementations
   - Each tool extends the base MCP Tool class
   - Provides standardized schema and execution methods

3. **MCP Client** (`src/services/mcpClient.js`)
   - Connects to the MCP server
   - Provides high-level API for tool interactions
   - Handles connection management and error handling

4. **Integration Layer**
   - Main application uses MCP client instead of direct service calls
   - Maintains backward compatibility
   - Provides fallback mechanisms

## Available MCP Tools

### 1. Bitbucket Tool (`bitbucket.js`)
**Purpose**: Manage repository operations and release branches

**Actions**:
- `createReleaseBranch` - Create a new release branch
- `getBranchInfo` - Get information about a specific branch
- `getCommits` - Retrieve commits from a branch
- `createPullRequest` - Create a pull request
- `getRepositoryInfo` - Get repository information
- `validateCredentials` - Validate Bitbucket credentials

**Example Usage**:
```javascript
// Create a release branch
const result = await mcpClient.bitbucket('createReleaseBranch', {
  version: '2.1.0',
  sourceBranch: 'main'
});
```

### 2. Jira Tool (`jira.js`)
**Purpose**: Manage sprints, stories, and generate release notes

**Actions**:
- `getSprintStories` - Get stories from a sprint
- `generateReleaseNotes` - Generate release notes from sprint data
- `getSprintInfo` - Get sprint information
- `getActiveSprints` - Get active sprints from a board
- `validateCredentials` - Validate Jira credentials

**Example Usage**:
```javascript
// Generate release notes
const result = await mcpClient.jira('generateReleaseNotes', {
  sprintId: '123',
  version: '2.1.0'
});
```

### 3. Terraform Tool (`terraform.js`)
**Purpose**: Manage infrastructure deployment on Jules server

**Actions**:
- `initializeTerraform` - Initialize Terraform workspace
- `selectWorkspace` - Select or create Terraform workspace
- `planInfrastructure` - Plan infrastructure changes
- `applyInfrastructure` - Apply infrastructure changes
- `destroyInfrastructure` - Destroy infrastructure
- `getTerraformOutput` - Get Terraform output values
- `getTerraformState` - Get Terraform state
- `validateTerraform` - Validate Terraform configuration
- `buildInfrastructure` - Complete infrastructure build process
- `testConnection` - Test SSH connection to Jules

**Example Usage**:
```javascript
// Build infrastructure
const result = await mcpClient.terraform('buildInfrastructure', {
  environment: 'staging'
});
```

### 4. Spinnaker Tool (`spinnaker.js`)
**Purpose**: Manage application deployments via Spinnaker

**Actions**:
- `getApplications` - Get all Spinnaker applications
- `getApplication` - Get specific application details
- `getPipelines` - Get pipelines for an application
- `triggerPipeline` - Trigger a pipeline execution
- `getPipelineExecution` - Get pipeline execution details
- `getPipelineExecutions` - Get recent pipeline executions
- `deployApplication` - Deploy an application
- `waitForDeployment` - Wait for deployment completion
- `getDeploymentStatus` - Get deployment status
- `rollbackDeployment` - Rollback a deployment
- `validateCredentials` - Validate Spinnaker credentials

**Example Usage**:
```javascript
// Deploy an application
const result = await mcpClient.spinnaker('deployApplication', {
  applicationName: 'backend-api',
  environment: 'staging',
  version: '2.1.0',
  artifacts: []
});
```

### 5. AWS Tool (`aws.js`)
**Purpose**: Verify and monitor AWS resources

**Actions**:
- `verifyEC2Instances` - Verify EC2 instances in a cluster
- `verifyECSServices` - Verify ECS services in a cluster
- `verifyLoadBalancers` - Verify load balancer health
- `verifyRDSInstances` - Verify RDS instance availability
- `verifyLambdaFunctions` - Verify Lambda function availability
- `checkCloudWatchMetrics` - Check CloudWatch metrics
- `performHealthCheck` - Perform HTTP health checks
- `verifyDeployment` - Complete deployment verification
- `validateCredentials` - Validate AWS credentials

**Example Usage**:
```javascript
// Verify deployment
const result = await mcpClient.aws('verifyDeployment', {
  environment: 'staging',
  applications: {
    ecsClusters: ['app-cluster'],
    loadBalancers: ['app-lb'],
    healthCheckEndpoints: ['https://api.example.com/health']
  }
});
```

### 6. Release Tool (`release.js`)
**Purpose**: Orchestrate complete release workflows

**Actions**:
- `createRelease` - Create a new release record
- `getReleaseStatus` - Get release status and step progress
- `getReleaseLogs` - Get release logs
- `updateStepStatus` - Update step status
- `completeRelease` - Mark release as completed
- `getReleases` - Get list of releases
- `addReleaseLog` - Add log entry to release
- `getReleaseStatistics` - Get release statistics

**Example Usage**:
```javascript
// Create a new release
const result = await mcpClient.release('createRelease', {
  version: '2.1.0',
  environment: 'staging',
  applications: [
    { name: 'backend-api', type: 'spring-boot' },
    { name: 'frontend-app', type: 'react' }
  ],
  sprintId: '123'
});
```

## Setup and Configuration

### 1. Environment Variables

Add these to your `.env` file:

```env
# MCP Configuration
MCP_SERVER_URL=ws://localhost:3002
MCP_PORT=3002
```

### 2. Starting the MCP Server

```bash
# Start MCP server
npm run mcp:start

# Or in development mode
npm run mcp:dev
```

### 3. Starting the Main Application

```bash
# Start main application (will connect to MCP server)
npm run dev
```

## Usage Examples

### Complete Release Workflow

```javascript
// 1. Create release
const release = await mcpClient.createRelease('2.1.0', 'staging', applications, '123');

// 2. Create release branch
await mcpClient.createReleaseBranch('2.1.0');

// 3. Generate release notes
await mcpClient.generateReleaseNotes('123', '2.1.0');

// 4. Build infrastructure
await mcpClient.buildInfrastructure('staging');

// 5. Deploy applications
for (const app of applications) {
  await mcpClient.deployApplication(app.name, 'staging', '2.1.0', app.artifacts);
}

// 6. Verify deployment
await mcpClient.verifyDeployment('staging', applications);

// 7. Complete release
await mcpClient.completeRelease(release.id);
```

### Tool Discovery

```javascript
// Get available tools
const tools = mcpClient.getAvailableTools();
console.log('Available tools:', tools);

// Get tool information
const toolInfo = mcpClient.getToolInfo('bitbucket');
console.log('Bitbucket tool schema:', toolInfo.schema);
```

### Health Checks

```javascript
// Validate all credentials
const results = await mcpClient.validateAllCredentials();
console.log('Credential validation results:', results);
```

## Error Handling

MCP provides consistent error handling across all tools:

```javascript
try {
  const result = await mcpClient.bitbucket('createReleaseBranch', {
    version: '2.1.0'
  });
  console.log('Success:', result.message);
} catch (error) {
  console.error('Error:', error.message);
  // Error includes tool name, action, and detailed error message
}
```

## Benefits of MCP Integration

### 1. **Modularity**
- Each tool is self-contained and can be developed independently
- Easy to add new tools without modifying existing code
- Clear separation of concerns

### 2. **Extensibility**
- New tools can be added by implementing the MCP Tool interface
- Tools can be dynamically discovered and used
- No need to restart the main application when adding tools

### 3. **Standardization**
- All tools follow the same API pattern
- Consistent error handling and response formats
- Standardized schema definitions

### 4. **Maintainability**
- Clear tool boundaries and responsibilities
- Easy to test individual tools
- Simplified debugging and troubleshooting

### 5. **Scalability**
- Tools can be distributed across multiple servers
- Load balancing and failover support
- Horizontal scaling capabilities

## Troubleshooting

### Common Issues

1. **MCP Server Not Running**
   ```
   Error: Failed to connect to MCP server
   Solution: Start the MCP server with `npm run mcp:start`
   ```

2. **Tool Not Found**
   ```
   Error: Tool 'bitbucket' not found
   Solution: Check that the tool is properly registered in the MCP server
   ```

3. **Connection Issues**
   ```
   Error: WebSocket connection failed
   Solution: Verify MCP_SERVER_URL and ensure the server is accessible
   ```

4. **Credential Validation Failed**
   ```
   Error: Bitbucket credentials validation failed
   Solution: Check environment variables and API token permissions
   ```

### Debug Mode

Enable debug logging by setting:

```env
LOG_LEVEL=debug
```

This will show detailed MCP communication logs.

## Future Enhancements

### Planned Features

1. **Tool Versioning**: Support for multiple versions of the same tool
2. **Tool Dependencies**: Tools that depend on other tools
3. **Async Operations**: Long-running operations with progress tracking
4. **Tool Metrics**: Performance monitoring and metrics collection
5. **Plugin System**: Dynamic tool loading from external sources

### Custom Tools

You can create custom MCP tools by:

1. Creating a new tool class in `src/mcp/tools/`
2. Extending the base `Tool` class
3. Implementing the required methods
4. Registering the tool in the MCP server

Example custom tool:

```javascript
const { Tool } = require('@modelcontextprotocol/server');

class CustomTool extends Tool {
  constructor() {
    super({
      name: 'custom',
      description: 'Custom tool description',
      version: '1.0.0'
    });
  }

  getSchema() {
    return {
      name: 'custom',
      description: 'Custom tool',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['customAction'],
            description: 'The action to perform'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;
    
    switch (action) {
      case 'customAction':
        return await this.customAction(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async customAction(params) {
    // Implementation here
    return {
      success: true,
      message: 'Custom action completed'
    };
  }
}

module.exports = CustomTool;
```

## Conclusion

The MCP integration provides a robust, scalable, and maintainable foundation for the release process chatbot. It standardizes all external tool interactions while maintaining flexibility and extensibility for future enhancements.

The system now supports:
- ✅ All original functionality through MCP tools
- ✅ Standardized tool interfaces
- ✅ Dynamic tool discovery
- ✅ Consistent error handling
- ✅ Easy extensibility
- ✅ Better maintainability

This architecture ensures the chatbot can easily adapt to new tools and requirements while maintaining a clean, modular codebase.

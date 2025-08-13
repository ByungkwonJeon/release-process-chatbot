// Environment configuration for the release process chatbot
const environments = {
  local: {
    name: 'local',
    displayName: 'Local',
    description: 'Local development environment',
    terraformWorkspace: 'local',
    terraformVarFile: 'local.tfvars',
    spinnakerPipeline: 'local-deploy',
    awsRegion: 'us-east-1',
    awsProfile: 'local',
    julesHost: 'localhost',
    julesUsername: 'local-user',
    sshKeyPath: '/path/to/local/key',
    allowedActions: ['init', 'plan', 'validate', 'output', 'state'],
    requiresApproval: false,
    autoDeploy: true,
    healthCheckEndpoints: [
      'http://localhost:3000/health',
      'http://localhost:8080/health'
    ]
  },
  dev: {
    name: 'dev',
    displayName: 'Development',
    description: 'Development environment for feature testing',
    terraformWorkspace: 'dev',
    terraformVarFile: 'dev.tfvars',
    spinnakerPipeline: 'dev-deploy',
    awsRegion: 'us-east-1',
    awsProfile: 'dev',
    julesHost: 'jules-dev.example.com',
    julesUsername: 'terraform-user',
    sshKeyPath: '/path/to/dev/key',
    allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state'],
    requiresApproval: false,
    autoDeploy: true,
    healthCheckEndpoints: [
      'https://dev-api.example.com/health',
      'https://dev-web.example.com/health'
    ]
  },
  test: {
    name: 'test',
    displayName: 'Test',
    description: 'Testing environment for QA and integration testing',
    terraformWorkspace: 'test',
    terraformVarFile: 'test.tfvars',
    spinnakerPipeline: 'test-deploy',
    awsRegion: 'us-east-1',
    awsProfile: 'test',
    julesHost: 'jules-test.example.com',
    julesUsername: 'terraform-user',
    sshKeyPath: '/path/to/test/key',
    allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state'],
    requiresApproval: false,
    autoDeploy: true,
    healthCheckEndpoints: [
      'https://test-api.example.com/health',
      'https://test-web.example.com/health'
    ]
  },
  cat: {
    name: 'cat',
    displayName: 'CAT (Customer Acceptance Testing)',
    description: 'Customer acceptance testing environment',
    terraformWorkspace: 'cat',
    terraformVarFile: 'cat.tfvars',
    spinnakerPipeline: 'cat-deploy',
    awsRegion: 'us-east-1',
    awsProfile: 'cat',
    julesHost: 'jules-cat.example.com',
    julesUsername: 'terraform-user',
    sshKeyPath: '/path/to/cat/key',
    allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state'],
    requiresApproval: true,
    autoDeploy: false,
    healthCheckEndpoints: [
      'https://cat-api.example.com/health',
      'https://cat-web.example.com/health'
    ]
  },
  prod: {
    name: 'prod',
    displayName: 'Production',
    description: 'Production environment for live applications',
    terraformWorkspace: 'prod',
    terraformVarFile: 'prod.tfvars',
    spinnakerPipeline: 'prod-deploy',
    awsRegion: 'us-east-1',
    awsProfile: 'prod',
    julesHost: 'jules-prod.example.com',
    julesUsername: 'terraform-user',
    sshKeyPath: '/path/to/prod/key',
    allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state'],
    requiresApproval: true,
    autoDeploy: false,
    healthCheckEndpoints: [
      'https://api.example.com/health',
      'https://web.example.com/health'
    ]
  }
};

// Environment validation
function validateEnvironment(envName) {
  if (!environments[envName]) {
    throw new Error(`Invalid environment: ${envName}. Supported environments: ${Object.keys(environments).join(', ')}`);
  }
  return environments[envName];
}

// Get environment configuration
function getEnvironmentConfig(envName) {
  return validateEnvironment(envName);
}

// Get all environments
function getAllEnvironments() {
  return Object.keys(environments).map(key => ({
    name: key,
    ...environments[key]
  }));
}

// Check if action is allowed for environment
function isActionAllowed(envName, action) {
  const env = validateEnvironment(envName);
  return env.allowedActions.includes(action);
}

// Check if environment requires approval
function requiresApproval(envName) {
  const env = validateEnvironment(envName);
  return env.requiresApproval;
}

// Get environment-specific Terraform workspace
function getTerraformWorkspace(envName) {
  const env = validateEnvironment(envName);
  return env.terraformWorkspace;
}

// Get environment-specific Terraform var file
function getTerraformVarFile(envName) {
  const env = validateEnvironment(envName);
  return env.terraformVarFile;
}

// Get environment-specific Spinnaker pipeline
function getSpinnakerPipeline(envName) {
  const env = validateEnvironment(envName);
  return env.spinnakerPipeline;
}

// Get environment-specific AWS region
function getAWSRegion(envName) {
  const env = validateEnvironment(envName);
  return env.awsRegion;
}

// Get environment-specific health check endpoints
function getHealthCheckEndpoints(envName) {
  const env = validateEnvironment(envName);
  return env.healthCheckEndpoints;
}

module.exports = {
  environments,
  validateEnvironment,
  getEnvironmentConfig,
  getAllEnvironments,
  isActionAllowed,
  requiresApproval,
  getTerraformWorkspace,
  getTerraformVarFile,
  getSpinnakerPipeline,
  getAWSRegion,
  getHealthCheckEndpoints
};

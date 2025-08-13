// Terraform projects configuration
const terraformProjects = {
  'terraform-infra': {
    name: 'terraform-infra',
    displayName: 'Infrastructure',
    description: 'Core infrastructure components (VPC, ECS, RDS, ALB)',
    type: 'terraform',
    repository: 'terraform-infrastructure',
    environments: {
      local: {
        workspace: 'local',
        varFile: 'local.tfvars',
        workingDirectory: '/opt/terraform/local',
        allowedActions: ['init', 'plan', 'validate', 'output', 'state']
      },
      dev: {
        workspace: 'dev',
        varFile: 'dev.tfvars',
        workingDirectory: '/opt/terraform/dev',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      test: {
        workspace: 'test',
        varFile: 'test.tfvars',
        workingDirectory: '/opt/terraform/test',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      cat: {
        workspace: 'cat',
        varFile: 'cat.tfvars',
        workingDirectory: '/opt/terraform/cat',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      prod: {
        workspace: 'prod',
        varFile: 'prod.tfvars',
        workingDirectory: '/opt/terraform/prod',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      }
    },
    dependencies: [],
    estimatedDuration: '10-15 minutes'
  },
  'terraform-monitoring': {
    name: 'terraform-monitoring',
    displayName: 'Monitoring Infrastructure',
    description: 'Monitoring and logging infrastructure (CloudWatch, ELK, Prometheus)',
    type: 'terraform',
    repository: 'terraform-monitoring',
    environments: {
      local: {
        workspace: 'local',
        varFile: 'local.tfvars',
        workingDirectory: '/opt/terraform/monitoring/local',
        allowedActions: ['init', 'plan', 'validate', 'output', 'state']
      },
      dev: {
        workspace: 'dev',
        varFile: 'dev.tfvars',
        workingDirectory: '/opt/terraform/monitoring/dev',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      test: {
        workspace: 'test',
        varFile: 'test.tfvars',
        workingDirectory: '/opt/terraform/monitoring/test',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      cat: {
        workspace: 'cat',
        varFile: 'cat.tfvars',
        workingDirectory: '/opt/terraform/monitoring/cat',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      prod: {
        workspace: 'prod',
        varFile: 'prod.tfvars',
        workingDirectory: '/opt/terraform/monitoring/prod',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      }
    },
    dependencies: ['terraform-infra'],
    estimatedDuration: '5-10 minutes'
  },
  'terraform-security': {
    name: 'terraform-security',
    displayName: 'Security Infrastructure',
    description: 'Security components (IAM, Security Groups, WAF, GuardDuty)',
    type: 'terraform',
    repository: 'terraform-security',
    environments: {
      local: {
        workspace: 'local',
        varFile: 'local.tfvars',
        workingDirectory: '/opt/terraform/security/local',
        allowedActions: ['init', 'plan', 'validate', 'output', 'state']
      },
      dev: {
        workspace: 'dev',
        varFile: 'dev.tfvars',
        workingDirectory: '/opt/terraform/security/dev',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      test: {
        workspace: 'test',
        varFile: 'test.tfvars',
        workingDirectory: '/opt/terraform/security/test',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      cat: {
        workspace: 'cat',
        varFile: 'cat.tfvars',
        workingDirectory: '/opt/terraform/security/cat',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      prod: {
        workspace: 'prod',
        varFile: 'prod.tfvars',
        workingDirectory: '/opt/terraform/security/prod',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      }
    },
    dependencies: ['terraform-infra'],
    estimatedDuration: '8-12 minutes'
  },
  'terraform-databases': {
    name: 'terraform-databases',
    displayName: 'Database Infrastructure',
    description: 'Database infrastructure (RDS, DynamoDB, ElastiCache, SQS)',
    type: 'terraform',
    repository: 'terraform-databases',
    environments: {
      local: {
        workspace: 'local',
        varFile: 'local.tfvars',
        workingDirectory: '/opt/terraform/databases/local',
        allowedActions: ['init', 'plan', 'validate', 'output', 'state']
      },
      dev: {
        workspace: 'dev',
        varFile: 'dev.tfvars',
        workingDirectory: '/opt/terraform/databases/dev',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      test: {
        workspace: 'test',
        varFile: 'test.tfvars',
        workingDirectory: '/opt/terraform/databases/test',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      cat: {
        workspace: 'cat',
        varFile: 'cat.tfvars',
        workingDirectory: '/opt/terraform/databases/cat',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      prod: {
        workspace: 'prod',
        varFile: 'prod.tfvars',
        workingDirectory: '/opt/terraform/databases/prod',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      }
    },
    dependencies: ['terraform-infra', 'terraform-security'],
    estimatedDuration: '12-18 minutes'
  },
  'terraform-networking': {
    name: 'terraform-networking',
    displayName: 'Networking Infrastructure',
    description: 'Networking components (VPC, Subnets, Route53, API Gateway)',
    type: 'terraform',
    repository: 'terraform-networking',
    environments: {
      local: {
        workspace: 'local',
        varFile: 'local.tfvars',
        workingDirectory: '/opt/terraform/networking/local',
        allowedActions: ['init', 'plan', 'validate', 'output', 'state']
      },
      dev: {
        workspace: 'dev',
        varFile: 'dev.tfvars',
        workingDirectory: '/opt/terraform/networking/dev',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      test: {
        workspace: 'test',
        varFile: 'test.tfvars',
        workingDirectory: '/opt/terraform/networking/test',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      cat: {
        workspace: 'cat',
        varFile: 'cat.tfvars',
        workingDirectory: '/opt/terraform/networking/cat',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      },
      prod: {
        workspace: 'prod',
        varFile: 'prod.tfvars',
        workingDirectory: '/opt/terraform/networking/prod',
        allowedActions: ['init', 'plan', 'apply', 'validate', 'output', 'state']
      }
    },
    dependencies: [],
    estimatedDuration: '6-10 minutes'
  }
};

// Get all Terraform projects
function getAllTerraformProjects() {
  return Object.keys(terraformProjects).map(key => ({
    name: key,
    ...terraformProjects[key]
  }));
}

// Get Terraform project configuration
function getTerraformProject(projectName) {
  if (!terraformProjects[projectName]) {
    throw new Error(`Terraform project '${projectName}' not found. Available projects: ${Object.keys(terraformProjects).join(', ')}`);
  }
  return terraformProjects[projectName];
}

// Get environment-specific configuration for a Terraform project
function getTerraformProjectEnvironment(projectName, environment) {
  const project = getTerraformProject(projectName);
  if (!project.environments[environment]) {
    throw new Error(`Environment '${environment}' not supported for Terraform project '${projectName}'. Supported environments: ${Object.keys(project.environments).join(', ')}`);
  }
  return project.environments[environment];
}

// Check if action is allowed for a Terraform project in a specific environment
function isTerraformActionAllowed(projectName, environment, action) {
  const envConfig = getTerraformProjectEnvironment(projectName, environment);
  return envConfig.allowedActions.includes(action);
}

// Get project dependencies
function getProjectDependencies(projectName) {
  const project = getTerraformProject(projectName);
  return project.dependencies || [];
}

// Get projects that depend on a specific project
function getProjectsThatDependOn(projectName) {
  return Object.keys(terraformProjects).filter(key => {
    const project = terraformProjects[key];
    return project.dependencies && project.dependencies.includes(projectName);
  });
}

// Validate project dependencies
function validateProjectDependencies(projectNames) {
  const validated = [];
  const errors = [];

  for (const projectName of projectNames) {
    try {
      const project = getTerraformProject(projectName);
      const missingDeps = project.dependencies.filter(dep => !projectNames.includes(dep));
      
      if (missingDeps.length > 0) {
        errors.push(`Project '${projectName}' requires dependencies: ${missingDeps.join(', ')}`);
      } else {
        validated.push(projectName);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Dependency validation failed:\n${errors.join('\n')}`);
  }

  return validated;
}

// Get deployment order based on dependencies
function getDeploymentOrder(projectNames) {
  const order = [];
  const visited = new Set();

  function visit(projectName) {
    if (visited.has(projectName)) return;
    visited.add(projectName);

    const project = getTerraformProject(projectName);
    for (const dep of project.dependencies) {
      if (projectNames.includes(dep)) {
        visit(dep);
      }
    }
    order.push(projectName);
  }

  for (const projectName of projectNames) {
    visit(projectName);
  }

  return order;
}

module.exports = {
  terraformProjects,
  getAllTerraformProjects,
  getTerraformProject,
  getTerraformProjectEnvironment,
  isTerraformActionAllowed,
  getProjectDependencies,
  getProjectsThatDependOn,
  validateProjectDependencies,
  getDeploymentOrder
};

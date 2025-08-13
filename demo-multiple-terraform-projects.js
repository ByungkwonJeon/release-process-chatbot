console.log('🏗️ **Multiple Terraform Projects Demo**\n');

console.log('📋 **Available Terraform Projects:**\n');

const terraformProjects = {
  'terraform-infra': {
    displayName: 'Infrastructure',
    description: 'Core infrastructure components (VPC, ECS, RDS, ALB)',
    repository: 'terraform-infrastructure',
    estimatedDuration: '10-15 minutes',
    dependencies: 'None',
    environments: 'local, dev, test, cat, prod'
  },
  'terraform-monitoring': {
    displayName: 'Monitoring Infrastructure',
    description: 'Monitoring and logging infrastructure (CloudWatch, ELK, Prometheus)',
    repository: 'terraform-monitoring',
    estimatedDuration: '5-10 minutes',
    dependencies: 'terraform-infra',
    environments: 'local, dev, test, cat, prod'
  },
  'terraform-security': {
    displayName: 'Security Infrastructure',
    description: 'Security components (IAM, Security Groups, WAF, GuardDuty)',
    repository: 'terraform-security',
    estimatedDuration: '8-12 minutes',
    dependencies: 'terraform-infra',
    environments: 'local, dev, test, cat, prod'
  },
  'terraform-databases': {
    displayName: 'Database Infrastructure',
    description: 'Database infrastructure (RDS, DynamoDB, ElastiCache, SQS)',
    repository: 'terraform-databases',
    estimatedDuration: '12-18 minutes',
    dependencies: 'terraform-infra, terraform-security',
    environments: 'local, dev, test, cat, prod'
  },
  'terraform-networking': {
    displayName: 'Networking Infrastructure',
    description: 'Networking components (VPC, Subnets, Route53, API Gateway)',
    repository: 'terraform-networking',
    estimatedDuration: '6-10 minutes',
    dependencies: 'None',
    environments: 'local, dev, test, cat, prod'
  }
};

Object.entries(terraformProjects).forEach(([name, project]) => {
  console.log(`**${project.displayName}** (${name})`);
  console.log(`📝 ${project.description}`);
  console.log(`📦 Repository: ${project.repository}`);
  console.log(`⏱️ Estimated Duration: ${project.estimatedDuration}`);
  console.log(`🔗 Dependencies: ${project.dependencies}`);
  console.log(`🌍 Supported Environments: ${project.environments}\n`);
});

console.log('🚀 **Terraform Project Commands:**\n');

console.log('**List All Terraform Projects:**');
console.log('User: "List terraform projects"');
console.log('User: "List all terraform projects"');
console.log('User: "Show terraform projects"\n');

console.log('**Project Information:**');
console.log('User: "Show info for terraform project terraform-infra"');
console.log('User: "Info for terraform project terraform-monitoring"');
console.log('User: "Project info terraform-security"\n');

console.log('**Single Project Operations:**');
console.log('User: "Initialize terraform project terraform-infra for dev"');
console.log('User: "Plan terraform project terraform-monitoring for test"');
console.log('User: "Apply terraform project terraform-security for prod"');
console.log('User: "Validate terraform project terraform-databases for dev"');
console.log('User: "Get terraform output for project terraform-infra for dev"');
console.log('User: "Show terraform state for project terraform-monitoring for test"\n');

console.log('**Multiple Project Operations:**');
console.log('User: "Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"');
console.log('User: "Apply multiple terraform projects terraform-infra, terraform-security, terraform-databases for test"');
console.log('User: "Deploy multiple terraform projects terraform-networking, terraform-infra for prod"\n');

console.log('🎯 **Project Workflow Examples:**\n');

console.log('**Complete Infrastructure Deployment:**');
console.log('User: "Deploy multiple terraform projects terraform-infra, terraform-security, terraform-databases for dev"');
console.log('Bot: 🚀 **Deploying Multiple Terraform Projects**');
console.log('Bot: **Environment:** dev');
console.log('Bot: **Projects:** terraform-infra, terraform-security, terraform-databases');
console.log('Bot: **Deployment Order:** terraform-infra → terraform-security → terraform-databases');
console.log('Bot: 🏗️ **Deploying Infrastructure...**');
console.log('Bot: ✅ Infrastructure deployed successfully');
console.log('Bot: 🏗️ **Deploying Security Infrastructure...**');
console.log('Bot: ✅ Security Infrastructure deployed successfully');
console.log('Bot: 🏗️ **Deploying Database Infrastructure...**');
console.log('Bot: ✅ Database Infrastructure deployed successfully');
console.log('Bot: 🎉 **Deployment Summary:** 3/3 projects deployed successfully\n');

console.log('**Individual Project Operations:**');
console.log('User: "Initialize terraform project terraform-monitoring for test"');
console.log('Bot: ✅ **Terraform Initialized Successfully**');
console.log('Bot: **Project:** Monitoring Infrastructure');
console.log('Bot: **Environment:** test');
console.log('Bot: **Workspace:** test');
console.log('Bot: **Working Directory:** /opt/terraform/monitoring/test');
console.log('Bot: Terraform has been initialized and is ready for planning.\n');

console.log('User: "Plan terraform project terraform-monitoring for test"');
console.log('Bot: 📋 **Terraform Plan Generated**');
console.log('Bot: **Project:** Monitoring Infrastructure');
console.log('Bot: **Environment:** test');
console.log('Bot: **Workspace:** test');
console.log('Bot: Plan has been generated and saved. Review the changes before applying.\n');

console.log('User: "Apply terraform project terraform-monitoring for test"');
console.log('Bot: ✅ **Terraform Infrastructure Applied**');
console.log('Bot: **Project:** Monitoring Infrastructure');
console.log('Bot: **Environment:** test');
console.log('Bot: **Workspace:** test');
console.log('Bot: Infrastructure has been successfully deployed.\n');

console.log('🔗 **Project Dependencies:**\n');

console.log('**Dependency Management:**');
console.log('The chatbot automatically handles project dependencies:');
console.log('• terraform-infra - No dependencies (base infrastructure)');
console.log('• terraform-monitoring - Depends on terraform-infra');
console.log('• terraform-security - Depends on terraform-infra');
console.log('• terraform-databases - Depends on terraform-infra, terraform-security');
console.log('• terraform-networking - No dependencies\n');

console.log('**Deployment Order:**');
console.log('When deploying multiple projects, the chatbot automatically determines the correct order:');
console.log('terraform-infra → terraform-security → terraform-databases');
console.log('terraform-infra → terraform-monitoring');
console.log('terraform-networking (can be deployed independently)\n');

console.log('**Dependency Validation:**');
console.log('User: "Deploy multiple terraform projects terraform-databases, terraform-monitoring for dev"');
console.log('Bot: ❌ Dependency validation failed:');
console.log('Bot: Project \'terraform-databases\' requires dependencies: terraform-infra, terraform-security');
console.log('Bot: Project \'terraform-monitoring\' requires dependencies: terraform-infra\n');

console.log('🌍 **Environment-Specific Configurations:**\n');

console.log('**Project Environment Settings:**');
console.log('Each Terraform project has environment-specific configurations:');
console.log('| Project | Local | Dev | Test | CAT | Prod |');
console.log('|---------|-------|-----|------|-----|------|');
console.log('| terraform-infra | ✅ | ✅ | ✅ | ✅ | ✅ |');
console.log('| terraform-monitoring | ✅ | ✅ | ✅ | ✅ | ✅ |');
console.log('| terraform-security | ✅ | ✅ | ✅ | ✅ | ✅ |');
console.log('| terraform-databases | ✅ | ✅ | ✅ | ✅ | ✅ |');
console.log('| terraform-networking | ✅ | ✅ | ✅ | ✅ | ✅ |\n');

console.log('**Environment-Specific Actions:**');
console.log('Different environments allow different Terraform actions:');
console.log('• Local: init, plan, validate, output, state (no apply)');
console.log('• Dev/Test: init, plan, apply, validate, output, state');
console.log('• CAT/Prod: init, plan, apply, validate, output, state (with approval)\n');

console.log('🔐 **Security and Permissions:**\n');

console.log('**Action Permissions:**');
console.log('Each environment has specific allowed actions:');
console.log('Local Environment:');
console.log('• ✅ Initialize, Plan, Validate, Output, State');
console.log('• ❌ Apply (not allowed for safety)');
console.log('Development/Test Environments:');
console.log('• ✅ Initialize, Plan, Apply, Validate, Output, State');
console.log('• ✅ Full deployment capabilities');
console.log('CAT/Production Environments:');
console.log('• ✅ Initialize, Plan, Apply, Validate, Output, State');
console.log('• 🔒 Requires approval before apply\n');

console.log('**Permission Error Example:**');
console.log('User: "Apply terraform project terraform-infra for local"');
console.log('Bot: ❌ Terraform apply is not allowed for project \'Infrastructure\' in local environment.\n');

console.log('🎯 **Best Practices:**\n');

console.log('**1. Start with Core Infrastructure:**');
console.log('"Deploy multiple terraform projects terraform-infra for dev"\n');

console.log('**2. Add Security Layer:**');
console.log('"Deploy multiple terraform projects terraform-infra, terraform-security for dev"\n');

console.log('**3. Add Monitoring:**');
console.log('"Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"\n');

console.log('**4. Add Databases:**');
console.log('"Deploy multiple terraform projects terraform-infra, terraform-security, terraform-databases for dev"\n');

console.log('**5. Complete Stack:**');
console.log('"Deploy multiple terraform projects terraform-infra, terraform-security, terraform-monitoring, terraform-databases for dev"\n');

console.log('🚨 **Error Handling:**\n');

console.log('**Dependency Errors:**');
console.log('Bot: ❌ Dependency validation failed:');
console.log('Bot: Project \'terraform-databases\' requires dependencies: terraform-infra, terraform-security\n');

console.log('**Permission Errors:**');
console.log('Bot: ❌ Terraform apply is not allowed for project \'Infrastructure\' in local environment.\n');

console.log('**Project Not Found:**');
console.log('Bot: ❌ Terraform project \'terraform-unknown\' not found.');
console.log('Bot: Available projects: terraform-infra, terraform-monitoring, terraform-security, terraform-databases, terraform-networking\n');

console.log('**Environment Not Supported:**');
console.log('Bot: ❌ Environment \'unknown\' not supported for Terraform project \'terraform-infra\'.');
console.log('Bot: Supported environments: local, dev, test, cat, prod\n');

console.log('🎉 **Benefits of Multiple Terraform Projects:**\n');

console.log('✅ **Modular Architecture** - Separate concerns into focused projects');
console.log('✅ **Dependency Management** - Automatic handling of project dependencies');
console.log('✅ **Environment Isolation** - Each environment has its own configuration');
console.log('✅ **Selective Deployment** - Deploy only the projects you need');
console.log('✅ **Security Controls** - Environment-specific action permissions');
console.log('✅ **Parallel Development** - Teams can work on different projects');
console.log('✅ **Easier Maintenance** - Smaller, focused codebases');
console.log('✅ **Risk Mitigation** - Deploy projects incrementally');
console.log('✅ **Resource Optimization** - Deploy only what\'s needed');
console.log('✅ **Audit Trail** - Complete tracking of project deployments');

console.log('\n🏗️ **Ready to manage your multiple Terraform projects!**');

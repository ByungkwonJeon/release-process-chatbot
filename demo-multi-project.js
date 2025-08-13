console.log('🤖 **Multi-Project Release Chatbot Demo**\n');

console.log('📋 **Your Available Projects:**\n');

const projects = {
  'terraform-infra': {
    name: 'terraform-infra',
    type: 'terraform',
    repository: 'terraform-infrastructure',
    description: 'Infrastructure as Code - Terraform configuration'
  },
  'spring-boot-api': {
    name: 'spring-boot-api',
    type: 'spring-boot',
    repository: 'spring-boot-api',
    description: 'Spring Boot REST API'
  },
  'spring-boot-service': {
    name: 'spring-boot-service',
    type: 'spring-boot',
    repository: 'spring-boot-service',
    description: 'Spring Boot Microservice'
  },
  'lambda-functions': {
    name: 'lambda-functions',
    type: 'lambda',
    repository: 'lambda-functions',
    description: 'AWS Lambda Functions'
  }
};

Object.entries(projects).forEach(([key, project]) => {
  console.log(`• **${project.name}** (${project.type})`);
  console.log(`  Repository: ${project.repository}`);
  console.log(`  Description: ${project.description}\n`);
});

console.log('🚀 **Multi-Project Commands:**\n');

console.log('**List Available Projects:**');
console.log('User: "List projects"');
console.log('Bot: [Shows all available projects with details]\n');

console.log('**Start Multi-Project Release:**');
console.log('User: "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"');
console.log('Bot: 🚀 Multi-Project Release Started!');
console.log('     Version: 2.1.0');
console.log('     Projects: 2');
console.log('     • terraform-infra (terraform)');
console.log('     • spring-boot-api (spring-boot)\n');

console.log('**Build Individual Projects:**');
console.log('User: "Build project terraform-infra"');
console.log('Bot: 🔨 Project Build Completed');
console.log('     Project: terraform-infra');
console.log('     Type: terraform');
console.log('     Command: terraform init && terraform plan\n');

console.log('User: "Build project spring-boot-api"');
console.log('Bot: 🔨 Project Build Completed');
console.log('     Project: spring-boot-api');
console.log('     Type: spring-boot');
console.log('     Command: ./gradlew build\n');

console.log('**Deploy Individual Projects:**');
console.log('User: "Deploy project terraform-infra to staging"');
console.log('Bot: 🚀 Project Deployment Completed');
console.log('     Project: terraform-infra');
console.log('     Environment: staging');
console.log('     Command: terraform apply\n');

console.log('User: "Deploy project spring-boot-api to staging"');
console.log('Bot: 🚀 Project Deployment Completed');
console.log('     Project: spring-boot-api');
console.log('     Environment: staging');
console.log('     Command: java -jar build/libs/api.jar\n');

console.log('**Complete Workflow Example:**\n');

console.log('1. **List Projects**');
console.log('   User: "List projects"');
console.log('   Bot: [Shows all available projects]\n');

console.log('2. **Start Multi-Project Release**');
console.log('   User: "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api, lambda-functions"');
console.log('   Bot: [Creates release with 3 projects]\n');

console.log('3. **Check Status**');
console.log('   User: "What\'s the status?"');
console.log('   Bot: [Shows progress for all 3 projects]\n');

console.log('4. **Build Individual Projects**');
console.log('   User: "Build project terraform-infra"');
console.log('   User: "Build project spring-boot-api"');
console.log('   User: "Build project lambda-functions"');
console.log('   Bot: [Builds each project individually]\n');

console.log('5. **Deploy Projects**');
console.log('   User: "Deploy project terraform-infra to staging"');
console.log('   User: "Deploy project spring-boot-api to staging"');
console.log('   User: "Deploy project lambda-functions to staging"');
console.log('   Bot: [Deploys each project to staging]\n');

console.log('6. **Verify Deployment**');
console.log('   User: "What\'s the status?"');
console.log('   Bot: [Shows final status of all deployments]\n');

console.log('🎯 **Key Benefits:**\n');

console.log('✅ **Flexible Project Selection** - Choose which projects to include in a release');
console.log('✅ **Individual Project Control** - Build and deploy projects separately');
console.log('✅ **Different Project Types** - Handle Terraform, Spring Boot, and Lambda projects');
console.log('✅ **Bitbucket Integration** - Each project has its own repository');
console.log('✅ **Environment Management** - Deploy to different environments (staging, production)');
console.log('✅ **Unified Workflow** - Manage all projects through a single chatbot interface');

console.log('\n🎉 **Ready to manage your multi-project release process!**');

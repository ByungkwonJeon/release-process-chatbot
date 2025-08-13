# Multi-Project Management Guide

## 🎯 **Yes, the chatbot handles multiple projects!**

The chatbot is specifically designed to handle your multi-project setup with **Terraform**, **Spring Boot**, and **Lambda** projects from Bitbucket. Here's how it works:

## 📋 **Your Available Projects**

The chatbot is configured to handle these project types:

### **1. Terraform Infrastructure** (`terraform-infra`)
- **Repository**: `terraform-infrastructure`
- **Type**: Infrastructure as Code
- **Build Command**: `terraform init && terraform plan`
- **Deploy Command**: `terraform apply`
- **Description**: Infrastructure configuration and deployment

### **2. Spring Boot API** (`spring-boot-api`)
- **Repository**: `spring-boot-api`
- **Type**: Spring Boot Application
- **Build Command**: `./gradlew build`
- **Deploy Command**: `java -jar build/libs/api.jar`
- **Description**: REST API service

### **3. Spring Boot Service** (`spring-boot-service`)
- **Repository**: `spring-boot-service`
- **Type**: Spring Boot Application
- **Build Command**: `./gradlew build`
- **Deploy Command**: `java -jar build/libs/service.jar`
- **Description**: Microservice application

### **4. Lambda Functions** (`lambda-functions`)
- **Repository**: `lambda-functions`
- **Type**: AWS Lambda
- **Build Command**: `sam build`
- **Deploy Command**: `sam deploy`
- **Description**: Serverless functions

## 🚀 **Multi-Project Commands**

### **List Available Projects**
```
"List projects"
```
**Response:**
```
📋 Available Projects

terraform-infra (terraform)
Repository: terraform-infrastructure
Description: Infrastructure as Code - Terraform configuration
Build: `terraform init && terraform plan`
Deploy: `terraform apply`

spring-boot-api (spring-boot)
Repository: spring-boot-api
Description: Spring Boot REST API
Build: `./gradlew build`
Deploy: `java -jar build/libs/api.jar`
```

### **Start Multi-Project Release**
```
"Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"
```
**Response:**
```
🚀 Multi-Project Release Started!

Version: 2.1.0
Environment: staging
Projects: 2

• terraform-infra (terraform)
  Repository: terraform-infrastructure
• spring-boot-api (spring-boot)
  Repository: spring-boot-api

Release Workflow:
1. 🌿 Create release branches for all projects
2. 📝 Generate release notes from Jira
3. 🏗️ Build infrastructure (Terraform)
4. 🔨 Build all services (Spring Boot, Lambda)
5. 🚀 Deploy to staging via Spinnaker
6. ✅ Verify deployment and health checks

Release ID: abc123-def456
Check status anytime with "What's the status?"
```

### **Build Individual Projects**
```
"Build project terraform-infra"
"Build project spring-boot-api"
"Build project lambda-functions"
```
**Response:**
```
🔨 Project Build Completed

Project: terraform-infra
Type: terraform
Repository: terraform-infrastructure
Build ID: build-terraform-infra-1234567890
Status: ✅ Completed
Command: `terraform init && terraform plan`
```

### **Deploy Individual Projects**
```
"Deploy project terraform-infra to staging"
"Deploy project spring-boot-api to production"
"Deploy project lambda-functions to staging"
```
**Response:**
```
🚀 Project Deployment Completed

Project: spring-boot-api
Type: spring-boot
Environment: staging
Repository: spring-boot-api
Deployment ID: deploy-spring-boot-api-staging-1234567890
Status: ✅ Completed
Command: `java -jar build/libs/api.jar`
```

## 🎯 **Complete Multi-Project Workflow**

### **1. Discovery Phase**
```
User: "List projects"
Bot: [Shows all available projects with details]
```

### **2. Release Planning**
```
User: "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api, lambda-functions"
Bot: [Creates release with 3 projects, creates branches for each]
```

### **3. Individual Project Management**
```
User: "Build project terraform-infra"
Bot: [Builds Terraform infrastructure]

User: "Build project spring-boot-api"
Bot: [Builds Spring Boot API]

User: "Build project lambda-functions"
Bot: [Builds Lambda functions]
```

### **4. Deployment Management**
```
User: "Deploy project terraform-infra to staging"
Bot: [Deploys infrastructure first]

User: "Deploy project spring-boot-api to staging"
Bot: [Deploys API service]

User: "Deploy project lambda-functions to staging"
Bot: [Deploys Lambda functions]
```

### **5. Verification**
```
User: "What's the status?"
Bot: [Shows status of all projects and deployments]
```

## 🔧 **Project Configuration**

### **Customizing Project Settings**

You can customize the project configurations in `src/utils/chatbotLogic.js`:

```javascript
this.availableProjects = {
  'your-project-name': {
    name: 'your-project-name',
    type: 'your-project-type',
    repository: 'your-bitbucket-repo',
    buildCommand: 'your-build-command',
    deployCommand: 'your-deploy-command',
    description: 'Your project description'
  }
};
```

### **Adding New Projects**

To add a new project:

1. **Add to configuration**:
   ```javascript
   'new-project': {
     name: 'new-project',
     type: 'spring-boot',
     repository: 'new-project-repo',
     buildCommand: './gradlew build',
     deployCommand: 'java -jar build/libs/new-project.jar',
     description: 'New Spring Boot project'
   }
   ```

2. **Update Bitbucket settings** in `.env`:
   ```env
   BITBUCKET_REPOSITORY=new-project-repo
   ```

3. **Restart the chatbot** to load new configuration

## 🎯 **Advanced Multi-Project Features**

### **Selective Release Management**
- **Choose specific projects**: `"with projects terraform-infra, spring-boot-api"`
- **Exclude projects**: Only include what you need for a release
- **Different environments**: Deploy different projects to different environments

### **Individual Project Control**
- **Build specific projects**: `"Build project terraform-infra"`
- **Deploy specific projects**: `"Deploy project spring-boot-api to staging"`
- **Check project status**: Individual project monitoring

### **Dependency Management**
- **Infrastructure first**: Terraform projects deploy before applications
- **Service dependencies**: Spring Boot services can depend on infrastructure
- **Lambda deployment**: Serverless functions deploy after infrastructure

## 📊 **Project Status Tracking**

### **Release Status**
```
📊 Release Status: 2.1.0

Environment: staging
Overall Status: in_progress

Project Progress:
✅ terraform-infra: Infrastructure deployed
🔄 spring-boot-api: Building...
⏳ lambda-functions: Pending

Step Progress:
✅ Create Release Branch: completed
✅ Generate Release Notes: completed
🔄 Build Infrastructure: in_progress
⏳ Build Services: pending
⏳ Deploy Services: pending
⏳ Verify Deployment: pending
```

### **Individual Project Logs**
```
📋 Logs for terraform-infra

[2024-01-15 10:30:15] INFO: Starting Terraform initialization...
[2024-01-15 10:30:18] INFO: Terraform initialized successfully
[2024-01-15 10:30:20] INFO: Planning infrastructure changes...
[2024-01-15 10:30:45] INFO: Plan completed - 5 resources to create
[2024-01-15 10:31:00] INFO: Applying infrastructure changes...
[2024-01-15 10:35:30] INFO: Infrastructure deployed successfully
```

## 🎉 **Benefits of Multi-Project Management**

### **✅ Flexible Project Selection**
- Choose which projects to include in a release
- Mix and match different project types
- Exclude projects that don't need updates

### **✅ Individual Project Control**
- Build and deploy projects separately
- Independent project monitoring
- Granular control over the release process

### **✅ Different Project Types**
- **Terraform**: Infrastructure as Code
- **Spring Boot**: Java applications
- **Lambda**: Serverless functions
- **Extensible**: Easy to add new project types

### **✅ Bitbucket Integration**
- Each project has its own repository
- Separate branch management
- Individual project versioning

### **✅ Environment Management**
- Deploy to different environments
- Environment-specific configurations
- Staging and production support

### **✅ Unified Workflow**
- Single chatbot interface for all projects
- Consistent command structure
- Centralized logging and monitoring

## 🚀 **Getting Started**

1. **List your projects**:
   ```
   "List projects"
   ```

2. **Start a multi-project release**:
   ```
   "Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"
   ```

3. **Build individual projects**:
   ```
   "Build project terraform-infra"
   "Build project spring-boot-api"
   ```

4. **Deploy projects**:
   ```
   "Deploy project terraform-infra to staging"
   "Deploy project spring-boot-api to staging"
   ```

5. **Monitor progress**:
   ```
   "What's the status?"
   ```

The chatbot is ready to handle your multi-project release process with full support for Terraform, Spring Boot, and Lambda projects from Bitbucket!

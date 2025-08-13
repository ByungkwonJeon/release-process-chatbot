# Multiple Terraform Projects Guide

## 🏗️ **Multiple Terraform Projects Management**

The chatbot supports **5 Terraform projects** with environment-specific configurations and dependency management:

- ✅ **terraform-infra** - Core infrastructure components (VPC, ECS, RDS, ALB)
- ✅ **terraform-monitoring** - Monitoring and logging infrastructure (CloudWatch, ELK, Prometheus)
- ✅ **terraform-security** - Security components (IAM, Security Groups, WAF, GuardDuty)
- ✅ **terraform-databases** - Database infrastructure (RDS, DynamoDB, ElastiCache, SQS)
- ✅ **terraform-networking** - Networking components (VPC, Subnets, Route53, API Gateway)

## 🚀 **Terraform Project Commands**

### **1. List All Terraform Projects**
```
"List terraform projects"
"List all terraform projects"
"Show terraform projects"
```

**Example Response:**
```
🏗️ **Available Terraform Projects:**

**Infrastructure** (terraform-infra)
📝 Core infrastructure components (VPC, ECS, RDS, ALB)
📦 Repository: terraform-infrastructure
⏱️ Estimated Duration: 10-15 minutes
🔗 Dependencies: None
🌍 Supported Environments: local, dev, test, cat, prod

**Monitoring Infrastructure** (terraform-monitoring)
📝 Monitoring and logging infrastructure (CloudWatch, ELK, Prometheus)
📦 Repository: terraform-monitoring
⏱️ Estimated Duration: 5-10 minutes
🔗 Dependencies: terraform-infra
🌍 Supported Environments: local, dev, test, cat, prod

**Security Infrastructure** (terraform-security)
📝 Security components (IAM, Security Groups, WAF, GuardDuty)
📦 Repository: terraform-security
⏱️ Estimated Duration: 8-12 minutes
🔗 Dependencies: terraform-infra
🌍 Supported Environments: local, dev, test, cat, prod

**Database Infrastructure** (terraform-databases)
📝 Database infrastructure (RDS, DynamoDB, ElastiCache, SQS)
📦 Repository: terraform-databases
⏱️ Estimated Duration: 12-18 minutes
🔗 Dependencies: terraform-infra, terraform-security
🌍 Supported Environments: local, dev, test, cat, prod

**Networking Infrastructure** (terraform-networking)
📝 Networking components (VPC, Subnets, Route53, API Gateway)
📦 Repository: terraform-networking
⏱️ Estimated Duration: 6-10 minutes
🔗 Dependencies: None
🌍 Supported Environments: local, dev, test, cat, prod
```

### **2. Project Information**
```
"Show info for terraform project terraform-infra"
"Info for terraform project terraform-monitoring"
"Project info terraform-security"
```

**Example Response:**
```
🏗️ **Terraform Project: Infrastructure**

📝 **Description:** Core infrastructure components (VPC, ECS, RDS, ALB)
📦 **Repository:** terraform-infrastructure
⏱️ **Estimated Duration:** 10-15 minutes
🔗 **Dependencies:** None

🌍 **Environment Configurations:**

**LOCAL Environment:**
• Workspace: local
• Variable File: local.tfvars
• Working Directory: /opt/terraform/local
• Allowed Actions: init, plan, validate, output, state

**DEV Environment:**
• Workspace: dev
• Variable File: dev.tfvars
• Working Directory: /opt/terraform/dev
• Allowed Actions: init, plan, apply, validate, output, state

**TEST Environment:**
• Workspace: test
• Variable File: test.tfvars
• Working Directory: /opt/terraform/test
• Allowed Actions: init, plan, apply, validate, output, state

**CAT Environment:**
• Workspace: cat
• Variable File: cat.tfvars
• Working Directory: /opt/terraform/cat
• Allowed Actions: init, plan, apply, validate, output, state

**PROD Environment:**
• Workspace: prod
• Variable File: prod.tfvars
• Working Directory: /opt/terraform/prod
• Allowed Actions: init, plan, apply, validate, output, state
```

## 🔧 **Single Project Operations**

### **Initialize Terraform Project**
```
"Initialize terraform project terraform-infra for dev"
"Init terraform project terraform-monitoring for test"
"Initialize terraform project terraform-security for prod"
```

### **Plan Terraform Project**
```
"Plan terraform project terraform-infra for dev"
"Show plan terraform project terraform-monitoring for test"
"Plan terraform project terraform-security for prod"
```

### **Apply Terraform Project**
```
"Apply terraform project terraform-infra for dev"
"Deploy terraform project terraform-monitoring for test"
"Apply terraform project terraform-security for prod"
```

### **Validate Terraform Project**
```
"Validate terraform project terraform-infra for dev"
"Check terraform project terraform-monitoring for test"
"Validate terraform project terraform-security for prod"
```

### **Get Terraform Output**
```
"Get terraform output for project terraform-infra for dev"
"Terraform outputs for project terraform-monitoring for test"
"Get terraform output for project terraform-security for prod"
```

### **Show Terraform State**
```
"Show terraform state for project terraform-infra for dev"
"Terraform state for project terraform-monitoring for test"
"Show terraform state for project terraform-security for prod"
```

## 🚀 **Multiple Project Operations**

### **Deploy Multiple Terraform Projects**
```
"Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"
"Apply multiple terraform projects terraform-infra, terraform-security, terraform-databases for test"
"Deploy multiple terraform projects terraform-networking, terraform-infra for prod"
```

**Example Response:**
```
🚀 **Deploying Multiple Terraform Projects**

**Environment:** dev
**Projects:** terraform-infra, terraform-monitoring
**Deployment Order:** terraform-infra → terraform-monitoring

🏗️ **Deploying Infrastructure...**
✅ Infrastructure deployed successfully

🏗️ **Deploying Monitoring Infrastructure...**
✅ Monitoring Infrastructure deployed successfully

🎉 **Deployment Summary:** 2/2 projects deployed successfully
```

## 🔗 **Project Dependencies**

### **Dependency Management**
The chatbot automatically handles project dependencies:

- **terraform-infra** - No dependencies (base infrastructure)
- **terraform-monitoring** - Depends on terraform-infra
- **terraform-security** - Depends on terraform-infra
- **terraform-databases** - Depends on terraform-infra, terraform-security
- **terraform-networking** - No dependencies

### **Deployment Order**
When deploying multiple projects, the chatbot automatically determines the correct order:

```
terraform-infra → terraform-security → terraform-databases
terraform-infra → terraform-monitoring
terraform-networking (can be deployed independently)
```

### **Dependency Validation**
```
User: "Deploy multiple terraform projects terraform-databases, terraform-monitoring for dev"
Bot: ❌ Dependency validation failed:
Bot: Project 'terraform-databases' requires dependencies: terraform-infra, terraform-security
Bot: Project 'terraform-monitoring' requires dependencies: terraform-infra
```

## 🌍 **Environment-Specific Configurations**

### **Project Environment Settings**
Each Terraform project has environment-specific configurations:

| Project | Local | Dev | Test | CAT | Prod |
|---------|-------|-----|------|-----|------|
| **terraform-infra** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **terraform-monitoring** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **terraform-security** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **terraform-databases** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **terraform-networking** | ✅ | ✅ | ✅ | ✅ | ✅ |

### **Environment-Specific Actions**
Different environments allow different Terraform actions:

- **Local**: `init`, `plan`, `validate`, `output`, `state` (no apply)
- **Dev/Test**: `init`, `plan`, `apply`, `validate`, `output`, `state`
- **CAT/Prod**: `init`, `plan`, `apply`, `validate`, `output`, `state` (with approval)

## 📊 **Project Workflow Examples**

### **Complete Infrastructure Deployment**
```
User: "Deploy multiple terraform projects terraform-infra, terraform-security, terraform-databases for dev"
Bot: 🚀 **Deploying Multiple Terraform Projects**

Bot: **Environment:** dev
Bot: **Projects:** terraform-infra, terraform-security, terraform-databases
Bot: **Deployment Order:** terraform-infra → terraform-security → terraform-databases

Bot: 🏗️ **Deploying Infrastructure...**
Bot: ✅ Infrastructure deployed successfully

Bot: 🏗️ **Deploying Security Infrastructure...**
Bot: ✅ Security Infrastructure deployed successfully

Bot: 🏗️ **Deploying Database Infrastructure...**
Bot: ✅ Database Infrastructure deployed successfully

Bot: 🎉 **Deployment Summary:** 3/3 projects deployed successfully
```

### **Individual Project Operations**
```
User: "Initialize terraform project terraform-monitoring for test"
Bot: ✅ **Terraform Initialized Successfully**

Bot: **Project:** Monitoring Infrastructure
Bot: **Environment:** test
Bot: **Workspace:** test
Bot: **Working Directory:** /opt/terraform/monitoring/test

Bot: Terraform has been initialized and is ready for planning.

User: "Plan terraform project terraform-monitoring for test"
Bot: 📋 **Terraform Plan Generated**

Bot: **Project:** Monitoring Infrastructure
Bot: **Environment:** test
Bot: **Workspace:** test

Bot: Plan has been generated and saved. Review the changes before applying.

User: "Apply terraform project terraform-monitoring for test"
Bot: ✅ **Terraform Infrastructure Applied**

Bot: **Project:** Monitoring Infrastructure
Bot: **Environment:** test
Bot: **Workspace:** test

Bot: Infrastructure has been successfully deployed.
```

## 🔐 **Security and Permissions**

### **Action Permissions**
Each environment has specific allowed actions:

**Local Environment:**
- ✅ Initialize, Plan, Validate, Output, State
- ❌ Apply (not allowed for safety)

**Development/Test Environments:**
- ✅ Initialize, Plan, Apply, Validate, Output, State
- ✅ Full deployment capabilities

**CAT/Production Environments:**
- ✅ Initialize, Plan, Apply, Validate, Output, State
- 🔒 Requires approval before apply

### **Permission Error Example**
```
User: "Apply terraform project terraform-infra for local"
Bot: ❌ Terraform apply is not allowed for project 'Infrastructure' in local environment.
```

## 🎯 **Best Practices**

### **1. Start with Core Infrastructure**
```
"Deploy multiple terraform projects terraform-infra for dev"
```

### **2. Add Security Layer**
```
"Deploy multiple terraform projects terraform-infra, terraform-security for dev"
```

### **3. Add Monitoring**
```
"Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"
```

### **4. Add Databases**
```
"Deploy multiple terraform projects terraform-infra, terraform-security, terraform-databases for dev"
```

### **5. Complete Stack**
```
"Deploy multiple terraform projects terraform-infra, terraform-security, terraform-monitoring, terraform-databases for dev"
```

## 🚨 **Error Handling**

### **Dependency Errors**
```
Bot: ❌ Dependency validation failed:
Bot: Project 'terraform-databases' requires dependencies: terraform-infra, terraform-security
```

### **Permission Errors**
```
Bot: ❌ Terraform apply is not allowed for project 'Infrastructure' in local environment.
```

### **Project Not Found**
```
Bot: ❌ Terraform project 'terraform-unknown' not found. 
Bot: Available projects: terraform-infra, terraform-monitoring, terraform-security, terraform-databases, terraform-networking
```

### **Environment Not Supported**
```
Bot: ❌ Environment 'unknown' not supported for Terraform project 'terraform-infra'. 
Bot: Supported environments: local, dev, test, cat, prod
```

## 🎉 **Benefits of Multiple Terraform Projects**

✅ **Modular Architecture** - Separate concerns into focused projects
✅ **Dependency Management** - Automatic handling of project dependencies
✅ **Environment Isolation** - Each environment has its own configuration
✅ **Selective Deployment** - Deploy only the projects you need
✅ **Security Controls** - Environment-specific action permissions
✅ **Parallel Development** - Teams can work on different projects
✅ **Easier Maintenance** - Smaller, focused codebases
✅ **Risk Mitigation** - Deploy projects incrementally
✅ **Resource Optimization** - Deploy only what's needed
✅ **Audit Trail** - Complete tracking of project deployments

## 🚀 **Quick Start**

1. **List Projects**: `"List terraform projects"`
2. **Project Info**: `"Show info for terraform project terraform-infra"`
3. **Single Deploy**: `"Apply terraform project terraform-infra for dev"`
4. **Multiple Deploy**: `"Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"`
5. **Check Status**: `"What's the status?"`

The chatbot provides complete management for multiple Terraform projects with dependency handling and environment-specific configurations!

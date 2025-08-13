# Terraform Commands Guide

## 🏗️ **Terraform Infrastructure Management**

The chatbot provides comprehensive Terraform infrastructure management through natural language commands. All Terraform operations are executed on the **Jules server** via SSH connection.

## 🚀 **Available Terraform Commands**

### **1. Infrastructure Build (Complete Workflow)**
```
"Build infrastructure for staging environment"
"Deploy infrastructure to production"
"Build terraform infrastructure"
"Initialize and deploy terraform"
```

### **2. Individual Terraform Operations**

#### **Initialize Terraform**
```
"Initialize terraform"
"Run terraform init"
"Setup terraform configuration"
```

#### **Select Workspace**
```
"Select terraform workspace production"
"Switch to staging workspace"
"Use terraform workspace development"
```

#### **Plan Infrastructure**
```
"Plan terraform for staging"
"Create terraform plan"
"Show terraform changes"
"Plan infrastructure changes"
```

#### **Apply Infrastructure**
```
"Apply terraform changes"
"Deploy terraform plan"
"Execute terraform apply"
"Apply infrastructure changes"
```

#### **Destroy Infrastructure**
```
"Destroy terraform infrastructure"
"Remove terraform resources"
"Tear down infrastructure"
"Destroy staging environment"
```

#### **Validate Configuration**
```
"Validate terraform configuration"
"Check terraform syntax"
"Verify terraform files"
"Validate terraform code"
```

#### **Get Output/State**
```
"Get terraform output"
"Show terraform state"
"Display terraform resources"
"Get infrastructure details"
```

### **3. Multi-Project Terraform Commands**
```
"Build project terraform-infra"
"Deploy project terraform-infra to staging"
"Build terraform infrastructure project"
```

## 📋 **Complete Terraform Workflow**

### **Step 1: Initialize and Setup**
```
User: "Initialize terraform"
Bot: 🔧 Initializing Terraform...
Bot: ✅ Terraform initialized successfully
Bot: 📁 Working directory: /opt/terraform
```

### **Step 2: Select Workspace**
```
User: "Select terraform workspace production"
Bot: 🔄 Selecting Terraform workspace: production
Bot: ✅ Terraform workspace production selected successfully
```

### **Step 3: Validate Configuration**
```
User: "Validate terraform configuration"
Bot: ✅ Validating Terraform configuration...
Bot: ✅ Terraform configuration validated successfully
Bot: 📋 Syntax check passed
```

### **Step 4: Plan Infrastructure**
```
User: "Plan terraform for staging"
Bot: 📋 Planning Terraform infrastructure for staging...
Bot: ✅ Terraform plan completed successfully
Bot: 📊 Changes planned: 5 resources to create, 2 to modify
```

### **Step 5: Apply Infrastructure**
```
User: "Apply terraform changes"
Bot: 🚀 Applying Terraform infrastructure...
Bot: ✅ Terraform infrastructure applied successfully
Bot: 🎉 Infrastructure deployment completed
```

### **Step 6: Get Output**
```
User: "Get terraform output"
Bot: 📤 Getting Terraform output...
Bot: ✅ Terraform output retrieved successfully
Bot: 🌐 Load Balancer DNS: staging-alb-123456.us-east-1.elb.amazonaws.com
Bot: 🗄️ Database Endpoint: staging-db.cluster-123456.us-east-1.rds.amazonaws.com
```

## 🎯 **Environment-Specific Commands**

### **Staging Environment**
```
"Build infrastructure for staging"
"Plan terraform for staging environment"
"Deploy to staging"
"Destroy staging infrastructure"
```

### **Production Environment**
```
"Build infrastructure for production"
"Plan terraform for production environment"
"Deploy to production"
"Destroy production infrastructure"
```

### **Development Environment**
```
"Build infrastructure for development"
"Plan terraform for development environment"
"Deploy to development"
"Destroy development infrastructure"
```

## 🔧 **Advanced Terraform Commands**

### **Custom Working Directory**
```
"Initialize terraform in /opt/custom-terraform"
"Plan infrastructure in /opt/staging-terraform"
"Apply terraform in /opt/production-terraform"
```

### **Workspace Management**
```
"Create new terraform workspace testing"
"List terraform workspaces"
"Switch to terraform workspace staging"
"Delete terraform workspace old-staging"
```

### **State Management**
```
"Show terraform state"
"Get terraform state details"
"List terraform resources"
"Show infrastructure status"
```

### **Output Management**
```
"Get terraform output values"
"Show terraform outputs"
"Display infrastructure endpoints"
"Get load balancer DNS"
"Get database connection details"
```

## 📊 **Terraform Command Examples**

### **Complete Infrastructure Deployment**
```
User: "Build infrastructure for staging environment"
Bot: 🏗️ Starting infrastructure build for staging...

Bot: Step 1: Initializing Terraform...
Bot: ✅ Terraform initialized successfully

Bot: Step 2: Selecting workspace...
Bot: ✅ Terraform workspace staging selected successfully

Bot: Step 3: Validating configuration...
Bot: ✅ Terraform configuration validated successfully

Bot: Step 4: Planning infrastructure...
Bot: ✅ Terraform plan completed successfully
Bot: 📊 Resources to create: 15
Bot: 📊 Resources to modify: 3
Bot: 📊 Resources to destroy: 0

Bot: Step 5: Applying infrastructure...
Bot: ✅ Terraform infrastructure applied successfully

Bot: Step 6: Getting output...
Bot: ✅ Terraform output retrieved successfully

Bot: 🎉 **Infrastructure Build Complete**
Bot: Environment: staging
Bot: Status: SUCCESS
Bot: Resources Created: 15
Bot: Resources Modified: 3
Bot: Load Balancer: staging-alb-123456.us-east-1.elb.amazonaws.com
Bot: Database: staging-db.cluster-123456.us-east-1.rds.amazonaws.com
```

### **Infrastructure Planning**
```
User: "Plan terraform for production"
Bot: 📋 Planning Terraform infrastructure for production...

Bot: ✅ Terraform plan completed successfully
Bot: 📊 **Plan Summary:**
Bot: • Resources to create: 20
Bot: • Resources to modify: 5
Bot: • Resources to destroy: 2
Bot: • Estimated cost: $1,250/month

Bot: 📋 **Key Changes:**
Bot: • New ECS cluster: production-cluster
Bot: • New RDS instance: production-db
Bot: • New ALB: production-alb
Bot: • Updated security groups
Bot: • New VPC endpoints
```

### **Infrastructure Validation**
```
User: "Validate terraform configuration"
Bot: ✅ Validating Terraform configuration...

Bot: ✅ Terraform configuration validated successfully
Bot: 📋 **Validation Results:**
Bot: • Syntax: ✅ Valid
Bot: • Variables: ✅ All defined
Bot: • Resources: ✅ All valid
Bot: • Dependencies: ✅ All resolved
Bot: • Security: ✅ No issues found
```

### **Infrastructure State Check**
```
User: "Show terraform state"
Bot: 📊 Getting Terraform state...

Bot: ✅ Terraform state retrieved successfully
Bot: 📋 **Current Infrastructure:**
Bot: • VPC: vpc-123456 (available)
Bot: • Subnets: 6 subnets (available)
Bot: • ECS Cluster: staging-cluster (active)
Bot: • RDS Instance: staging-db (available)
Bot: • ALB: staging-alb (active)
Bot: • Security Groups: 8 groups (configured)
```

## 🔍 **Terraform Output Examples**

### **Load Balancer Information**
```
User: "Get terraform output"
Bot: 📤 Getting Terraform output...

Bot: ✅ Terraform output retrieved successfully
Bot: 🌐 **Load Balancer:**
Bot: • DNS Name: staging-alb-123456.us-east-1.elb.amazonaws.com
Bot: • Zone ID: Z1234567890ABC
Bot: • ARN: arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/staging-alb/1234567890abcdef

Bot: 🗄️ **Database:**
Bot: • Endpoint: staging-db.cluster-123456.us-east-1.rds.amazonaws.com
Bot: • Port: 5432
Bot: • Engine: aurora-postgresql

Bot: 🔐 **Secrets:**
Bot: • Database Password: staging-db-password (in Secrets Manager)
Bot: • API Keys: staging-api-keys (in Secrets Manager)
```

## 🚨 **Terraform Error Handling**

### **Common Issues and Solutions**

#### **Connection Issues**
```
Bot: ❌ Failed to connect to Jules server
Bot: 🔧 **Troubleshooting:**
Bot: • Check SSH key path: /path/to/private/key
Bot: • Verify Jules server: jules.example.com
Bot: • Check username: terraform-user
Bot: • Ensure SSH access is configured
```

#### **Terraform Init Failures**
```
Bot: ❌ Terraform initialization failed
Bot: 🔧 **Troubleshooting:**
Bot: • Check working directory: /opt/terraform
Bot: • Verify terraform files exist
Bot: • Check backend configuration
Bot: • Ensure proper permissions
```

#### **Plan Failures**
```
Bot: ❌ Terraform plan failed
Bot: 🔧 **Troubleshooting:**
Bot: • Check variable definitions
Bot: • Verify resource configurations
Bot: • Check AWS credentials
Bot: • Review terraform syntax
```

#### **Apply Failures**
```
Bot: ❌ Terraform apply failed
Bot: 🔧 **Troubleshooting:**
Bot: • Check AWS service limits
Bot: • Verify resource dependencies
Bot: • Check IAM permissions
Bot: • Review error logs
```

## ⚙️ **Configuration**

### **Environment Variables**
```env
JULES_HOST=jules.example.com
JULES_USERNAME=terraform-user
JULES_SSH_KEY_PATH=/path/to/private/key
TERRAFORM_WORKSPACE=production
TERRAFORM_VAR_FILE=terraform.tfvars
```

### **Working Directory Structure**
```
/opt/terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars
├── providers.tf
└── modules/
    ├── vpc/
    ├── ecs/
    ├── rds/
    └── alb/
```

## 🎉 **Benefits**

✅ **Natural Language Commands** - Use simple English to manage infrastructure
✅ **Complete Workflow** - From init to apply in one command
✅ **Environment Management** - Easy switching between environments
✅ **Error Handling** - Comprehensive error reporting and troubleshooting
✅ **State Management** - Easy access to infrastructure state and outputs
✅ **Multi-Project Support** - Manage multiple Terraform projects
✅ **SSH Integration** - Secure execution on Jules server
✅ **Logging** - Complete audit trail of all operations

## 🚀 **Quick Start**

1. **Setup Environment Variables**
2. **Test Connection**: `"Test terraform connection"`
3. **Build Infrastructure**: `"Build infrastructure for staging"`
4. **Check Status**: `"Get terraform output"`
5. **Monitor Changes**: `"Show terraform state"`

The chatbot provides a complete Terraform management interface for your infrastructure deployment needs!

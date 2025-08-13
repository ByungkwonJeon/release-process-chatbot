# Release Process Chatbot - Setup Requirements

## Overview

This chatbot system automates your entire release process through natural language commands. It integrates with multiple tools and services to provide a seamless release management experience.

## What You Need to Support This System

### 1. **Infrastructure & Access**

#### **Bitbucket Access**
- **Repository Access**: Read/write access to your main repository
- **API Token**: Personal access token with repository permissions
- **Workspace**: Your Bitbucket workspace name
- **Repository**: Your main repository name

**Configuration:**
```env
BITBUCKET_WORKSPACE=your-workspace
BITBUCKET_REPO=your-repo
BITBUCKET_ACCESS_TOKEN=your-access-token
```

#### **Jira Access**
- **Jira Instance**: Access to your Jira instance
- **API Token**: Personal access token for Jira API
- **Email**: Your Jira account email
- **Sprint Access**: Ability to read sprint information

**Configuration:**
```env
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
```

#### **Jules Server Access**
- **SSH Access**: SSH key-based access to your Jules server
- **Terraform Installation**: Terraform must be installed on Jules
- **Working Directory**: Dedicated directory for Terraform operations

**Configuration:**
```env
JULES_HOST=your-jules-host.com
JULES_USERNAME=your-username
JULES_SSH_KEY_PATH=/path/to/your/ssh/key
```

#### **Spinnaker Access**
- **Spinnaker Instance**: Access to your Spinnaker deployment platform
- **Application Pipelines**: Pre-configured deployment pipelines
- **API Access**: REST API access to Spinnaker

**Configuration:**
```env
SPINNAKER_HOST=https://your-spinnaker-host.com
SPINNAKER_USERNAME=your-username
SPINNAKER_PASSWORD=your-password
```

#### **AWS Access**
- **AWS Credentials**: Access key and secret key
- **Region**: Target AWS region for deployments
- **Services**: Access to EC2, ECS, RDS, Lambda, CloudWatch

**Configuration:**
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### 2. **Application Architecture**

#### **Spring Boot Applications**
- **Build System**: Maven or Gradle configuration
- **Docker Images**: Containerized applications
- **Health Endpoints**: `/actuator/health` endpoints for verification
- **Configuration**: Environment-specific configurations

#### **React Applications**
- **Build Process**: Production build configuration
- **Static Hosting**: S3 or CDN hosting setup
- **Environment Variables**: Build-time configuration

#### **Lambda Functions**
- **Deployment Package**: Zipped function code
- **Runtime**: Node.js, Python, or Java runtime
- **IAM Roles**: Proper permissions for function execution

### 3. **Infrastructure as Code**

#### **Terraform Configuration**
- **State Management**: Remote state storage (S3, etc.)
- **Workspaces**: Environment-specific workspaces
- **Variables**: Environment-specific variable files
- **Modules**: Reusable infrastructure modules

**Required Terraform Resources:**
- VPC and networking
- ECS clusters and services
- RDS instances
- Load balancers
- Lambda functions
- CloudWatch monitoring

### 4. **Deployment Pipeline Configuration**

#### **Spinnaker Pipelines**
- **Application Pipelines**: One pipeline per application
- **Environment Stages**: Development, staging, production stages
- **Deployment Strategies**: Blue-green or rolling deployments
- **Health Checks**: Automated health verification

#### **Pipeline Naming Convention**
- `deploy-{application}-{environment}` (e.g., `deploy-backend-api-staging`)
- `rollback-{application}-{environment}` (e.g., `rollback-backend-api-staging`)

### 5. **Monitoring & Verification**

#### **Health Check Endpoints**
- **Application Health**: `/health` or `/actuator/health` endpoints
- **Load Balancer Health**: Target group health checks
- **Database Connectivity**: Connection pool health
- **External Dependencies**: Third-party service health

#### **CloudWatch Monitoring**
- **Custom Metrics**: Application-specific metrics
- **Alarms**: Automated alerting for failures
- **Logs**: Centralized logging (CloudWatch Logs)

### 6. **Security Requirements**

#### **Access Control**
- **IAM Roles**: Least privilege access for each service
- **Secrets Management**: AWS Secrets Manager or Parameter Store
- **Network Security**: VPC, security groups, and NACLs
- **SSL/TLS**: HTTPS endpoints and certificates

#### **API Security**
- **Authentication**: API keys or OAuth tokens
- **Rate Limiting**: API request throttling
- **Input Validation**: Sanitized user inputs

### 7. **Development Environment**

#### **Local Development**
- **Node.js 18+**: Required for the chatbot backend
- **npm or yarn**: Package management
- **Git**: Version control
- **SSH Keys**: For Jules server access

#### **Environment Variables**
- **Development**: Local development configuration
- **Staging**: Staging environment configuration
- **Production**: Production environment configuration

### 8. **Integration Points**

#### **CI/CD Integration**
- **Build Triggers**: Automatic builds on code changes
- **Artifact Storage**: Centralized artifact repository
- **Quality Gates**: Automated testing and validation

#### **Notification Systems**
- **Slack Integration**: Release notifications
- **Email Alerts**: Critical failure notifications
- **Webhook Support**: Custom integrations

## Setup Process

### 1. **Initial Setup**
```bash
# Clone the repository
git clone <repository-url>
cd chatbot_for_release_process

# Run setup script
./setup.sh

# Configure environment
cp env.example .env
# Edit .env with your configuration
```

### 2. **Configuration Steps**
1. **Bitbucket Setup**: Create access token and configure repository
2. **Jira Setup**: Generate API token and configure sprint access
3. **Jules Setup**: Configure SSH access and Terraform workspace
4. **Spinnaker Setup**: Configure application pipelines
5. **AWS Setup**: Configure credentials and permissions
6. **Database Setup**: Initialize SQLite database

### 3. **Testing Integration**
```bash
# Test Bitbucket integration
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Start a new release for version 1.0.0", "sessionId": "test-session"}'

# Test Jira integration
curl -X GET http://localhost:3001/api/releases

# Test AWS verification
curl -X GET http://localhost:3001/api/health
```

## Usage Examples

### **Starting a Release**
```
User: "Start a new release for version 2.1.0"
Bot: "🚀 I've started a new release for version 2.1.0! Here's what I'll do:
1. 🌿 Create release branch: release/v2.1.0
2. 📝 Generate release notes from Jira
3. 🏗️ Build infrastructure with Terraform
4. 🔨 Build services (Spring Boot, React, Lambda)
5. 🚀 Deploy to staging via Spinnaker
6. ✅ Verify deployment and health checks"
```

### **Checking Status**
```
User: "What's the status?"
Bot: "📊 Release Status: 2.1.0
Environment: staging
Overall Status: in_progress

Step Progress:
✅ Create Release Branch: completed
✅ Generate Release Notes: completed
🔄 Build Infrastructure: in_progress
⏳ Build Services: pending
⏳ Deploy Services: pending
⏳ Verify Deployment: pending"
```

### **Viewing Logs**
```
User: "Show me the logs"
Bot: "📝 Recent Logs for Release 2.1.0

ℹ️ [10:30:15] Starting build_infrastructure step
ℹ️ [10:30:18] Initializing Terraform...
ℹ️ [10:30:25] Planning infrastructure changes...
ℹ️ [10:30:30] Applying changes to AWS..."
```

## Troubleshooting

### **Common Issues**

1. **Bitbucket API Errors**
   - Verify access token permissions
   - Check workspace and repository names
   - Ensure repository exists and is accessible

2. **Jira API Errors**
   - Verify email and API token
   - Check Jira instance URL
   - Ensure sprint access permissions

3. **Terraform Errors**
   - Verify SSH key permissions
   - Check Terraform installation on Jules
   - Validate Terraform configuration files

4. **Spinnaker Errors**
   - Verify application pipeline names
   - Check Spinnaker credentials
   - Ensure pipeline permissions

5. **AWS Errors**
   - Verify AWS credentials
   - Check IAM permissions
   - Validate region configuration

### **Log Locations**
- **Application Logs**: `logs/combined.log`
- **Error Logs**: `logs/error.log`
- **Database**: `release_chatbot.db`

## Support and Maintenance

### **Regular Maintenance**
- **Database Backups**: Regular SQLite database backups
- **Log Rotation**: Implement log rotation for large deployments
- **Security Updates**: Regular dependency updates
- **Monitoring**: Set up application monitoring and alerting

### **Scaling Considerations**
- **Database**: Consider PostgreSQL for production
- **Caching**: Implement Redis for session management
- **Load Balancing**: Multiple server instances
- **CDN**: Static asset delivery optimization

## Next Steps

1. **Configure Environment**: Set up all required environment variables
2. **Test Integrations**: Verify each service integration works
3. **Deploy Applications**: Set up your application pipelines
4. **Train Team**: Educate team on chatbot commands
5. **Monitor Usage**: Track chatbot usage and effectiveness
6. **Iterate**: Improve based on user feedback and requirements

This system provides a comprehensive solution for managing your release process through natural language commands, integrating with all your existing tools and providing real-time visibility into the release process.

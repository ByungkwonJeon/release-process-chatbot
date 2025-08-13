# 🤖 Release Process Chatbot

A comprehensive AI-powered chatbot for automating release processes with Jira integration, Terraform management, and GitHub Copilot support.

## 🚀 Features

### **Release Process Automation**
- Create release branches on Bitbucket
- Generate release notes from Jira stories
- Build infrastructure with Terraform
- Deploy services via Spinnaker
- Verify deployments on AWS

### **Jira Integration**
- **OAuth2 Authentication**: Secure authentication using JPMorgan Chase ADFS
- Enhanced Jira tool with custom fields support
- Generate release notes with Epic, Sprint, Approver, and Team information
- Create Jira stories through natural language commands
- AI-powered story content generation with GitHub Copilot integration

### **Multi-Environment Support**
- Support for local, dev, test, cat, and prod environments
- Environment-specific configurations and approval workflows
- Security controls and action permissions

### **Multi-Project Management**
- Support for multiple Terraform projects with dependency management
- Spring Boot, Lambda, and infrastructure projects
- Selective deployment and individual project control

### **AWS Verification**
- Comprehensive AWS service verification (ECS, Route53, Lambda, ALB/NLB, VPC, IAM, etc.)
- Deployment status monitoring and health checks
- Infrastructure validation and compliance checks

## 🏗️ Architecture

### **Technology Stack**
- **Backend**: Node.js with Express.js
- **Frontend**: React.js with Tailwind CSS
- **Database**: File-based JSON storage (no external database required)
- **Real-time Communication**: Socket.IO
- **AI Integration**: Model Context Protocol (MCP)
- **Cloud Services**: AWS SDK, Terraform, Spinnaker
- **Version Control**: Bitbucket API
- **Issue Tracking**: Jira API with custom fields

### **MCP (Model Context Protocol) Integration**
- Standardized tool integration using MCP
- Enhanced Jira tool with hybrid approach
- Terraform, Spinnaker, and AWS tools
- Extensible architecture for additional integrations

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Access to Jira, Bitbucket, AWS, and Spinnaker
- GitHub Copilot (for AI-powered content generation)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/release-process-chatbot.git
cd release-process-chatbot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file with your configuration:

```env
# Jira Configuration
JIRA_HOST=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token  # Optional for OAuth2

# Jira OAuth2 Configuration (for JPMorgan Chase ADFS)
JIRA_ADFS_URL=https://idaq2.jpmorganchase.com/adfs/oauth2/token
JIRA_CLIENT_ID=PC-111661-SID-277611-PROD
JIRA_RESOURCE=JPMC:URI:RS-25188-87400-Jira0authAPI-PROD

# Bitbucket Configuration
BITBUCKET_HOST=https://api.bitbucket.org
BITBUCKET_USERNAME=your-username
BITBUCKET_APP_PASSWORD=your-app-password

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Spinnaker Configuration
SPINNAKER_HOST=https://your-spinnaker-host
SPINNAKER_API_TOKEN=your-api-token

# Jules Server Configuration
JULES_HOST=your-jules-server
JULES_USERNAME=your-username
JULES_SSH_KEY_PATH=/path/to/ssh/key

# Database Configuration
# Using file-based JSON storage (no external database required)
# Data will be stored in ./data/ directory

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Jira OAuth2 Setup (Optional)

If you're using JPMorgan Chase ADFS authentication, set up OAuth2:

1. **Create SID file** in your home directory:
```bash
echo "your-password" > ~/.sid
chmod 600 ~/.sid
```

2. **Test OAuth2 authentication**:
```bash
npm run test:jira
```

For detailed OAuth2 setup instructions, see [JIRA_OAUTH2_SETUP.md](JIRA_OAUTH2_SETUP.md).

### 5. Initialize Database
```bash
npm run db:init
```

### 6. Start the Services

#### Start MCP Server
```bash
npm run mcp:start
```

#### Start Main Application
```bash
npm start
```

#### Start in Development Mode
```bash
npm run dev
```

### 7. Access the Application
- **Web Interface**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **WebSocket**: ws://localhost:3000

## 📖 Usage Examples

### **Release Management**
```bash
# Start a new release
"Start a new release for version 2.1.0 for dev"

# Multi-project release
"Start a new release for version 2.1.0 with projects terraform-infra, spring-boot-api"

# Check status
"What's the status?"

# Show logs
"Show me the logs for the current release"
```

### **Jira Integration**
```bash
# Generate release notes
"Generate release notes for version 2.1.0 from sprint 123"

# Create Jira story
"Create jira story in project PROJ with title User authentication system"

# Generate AI-powered content
"Generate story content for title Payment integration in project PROJ with type story epic Payment System priority high"

# Get sprint stories
"Get stories from sprint 123"
```

### **Terraform Management**
```bash
# List Terraform projects
"List terraform projects"

# Deploy single project
"Apply terraform project terraform-infra for dev"

# Deploy multiple projects
"Deploy multiple terraform projects terraform-infra, terraform-monitoring for dev"

# Initialize project
"Initialize terraform project terraform-security for test"
```

### **Environment Management**
```bash
# List environments
"List environments"

# Environment info
"Show info for environment prod"

# Environment-specific release
"Start a new release for version 2.1.0 for prod"
```

## 🤖 GitHub Copilot Integration

### **VS Code Setup**
1. Install GitHub Copilot extension in VS Code
2. Ensure Copilot is enabled and authenticated
3. Use the chatbot to generate story content with Copilot suggestions

### **Copilot Commands**
```bash
# Generate story content with Copilot integration
"Generate story content for title User authentication system in project PROJ with type story epic User Management priority high"
```

### **VS Code Integration Steps**
1. Open Jira story in VS Code
2. Use `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac) to trigger Copilot
3. Use suggested prompts from the chatbot
4. Press Tab to accept Copilot suggestions
5. Review and refine generated content

## 📁 Project Structure

```
release-process-chatbot/
├── src/
│   ├── config/
│   │   ├── environments.js          # Multi-environment configuration
│   │   └── terraformProjects.js     # Terraform projects configuration
│   ├── mcp/
│   │   ├── server.js                # MCP server
│   │   └── tools/
│   │       ├── enhancedJira.js      # Enhanced Jira integration
│   │       ├── bitbucket.js         # Bitbucket integration
│   │       ├── terraform.js         # Terraform management
│   │       ├── spinnaker.js         # Spinnaker deployment
│   │       └── aws.js               # AWS verification
│   ├── models/
│   │   └── database.js              # Database models
│   ├── services/
│   │   └── mcpClient.js             # MCP client
│   ├── utils/
│   │   ├── chatbotLogic.js          # Main chatbot logic
│   │   └── logger.js                # Logging utility
│   └── workflows/
│       └── ReleaseWorkflow.js       # Release workflow orchestration
├── docs/                            # Documentation
├── demos/                           # Demo scripts
├── package.json
├── README.md
└── .env.example
```

## 🔧 Configuration

### **Environment Configuration**
The `src/config/environments.js` file defines environment-specific settings:
- Terraform workspaces and variable files
- Spinnaker pipeline configurations
- AWS regions and profiles
- Approval requirements and security controls

### **Terraform Projects Configuration**
The `src/config/terraformProjects.js` file defines:
- Available Terraform projects
- Project dependencies and deployment order
- Environment-specific configurations
- Allowed actions per environment

## 🧪 Testing

### **Run Tests**
```bash
npm test
```

### **Run Demo Scripts**
```bash
# Jira story creation demo
node demo-jira-story-creation.js

# Multi-environment demo
node demo-multi-environments.js

# Terraform projects demo
node demo-multiple-terraform-projects.js

# Copilot integration demo
node demo-copilot-integration.js
```

## 📚 Documentation

- [MCP Integration Guide](docs/MCP_INTEGRATION.md)
- [Hybrid Jira Approach](docs/HYBRID_APPROACH.md)
- [Chatbot Usage Guide](docs/CHATBOT_USAGE_GUIDE.md)
- [Multi-Project Guide](docs/MULTI_PROJECT_GUIDE.md)
- [Multi-Environment Guide](docs/MULTI_ENVIRONMENT_GUIDE.md)
- [AWS Verification Guide](docs/AWS_VERIFICATION_GUIDE.md)
- [Terraform Commands Guide](docs/TERRAFORM_COMMANDS_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Internal Use Only

This project is for internal/personal use only and is not intended for public distribution.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the demo scripts for usage examples

## 🚀 Roadmap

- [ ] Additional cloud provider support (Azure, GCP)
- [ ] Advanced AI features with OpenAI integration
- [ ] Mobile application
- [ ] Advanced analytics and reporting
- [ ] Integration with additional CI/CD tools
- [ ] Multi-language support
- [ ] Advanced security features

---

**Built with ❤️ for DevOps teams**

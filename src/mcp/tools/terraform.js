const { Tool } = require('@modelcontextprotocol/sdk/server/tools');
const { Client } = require('ssh2');
const fs = require('fs');
const { logger } = require('../../utils/logger');

class TerraformTool extends Tool {
  constructor() {
    super({
      name: 'terraform',
      description: 'Manage infrastructure deployment using Terraform on Jules server',
      version: '1.0.0'
    });

    this.host = process.env.JULES_HOST;
    this.username = process.env.JULES_USERNAME;
    this.sshKeyPath = process.env.JULES_SSH_KEY_PATH;
    this.terraformWorkspace = process.env.TERRAFORM_WORKSPACE || 'production';
    this.terraformVarFile = process.env.TERRAFORM_VAR_FILE || 'terraform.tfvars';
  }

  async executeCommand(command, workingDirectory = '/opt/terraform') {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        logger.info(`SSH connection established to ${this.host}`);
        
        conn.exec(command, { cwd: workingDirectory }, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          
          let stdout = '';
          let stderr = '';
          
          stream.on('close', (code) => {
            conn.end();
            if (code === 0) {
              resolve({ success: true, stdout, stderr, code });
            } else {
              reject(new Error(`Command failed with code ${code}: ${stderr}`));
            }
          }).on('data', (data) => {
            stdout += data.toString();
          }).stderr.on('data', (data) => {
            stderr += data.toString();
          });
        });
      }).connect({
        host: this.host,
        username: this.username,
        privateKey: fs.readFileSync(this.sshKeyPath)
      });
    });
  }

  async initializeTerraform(args) {
    try {
      const { workingDirectory = '/opt/terraform' } = args;
      
      logger.info('Initializing Terraform...');
      const result = await this.executeCommand('terraform init', workingDirectory);
      logger.info('Terraform initialized successfully');
      
      return {
        success: true,
        message: 'Terraform initialized successfully',
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to initialize Terraform:', error.message);
      throw error;
    }
  }

  async selectWorkspace(args) {
    try {
      const { workspace = this.terraformWorkspace, workingDirectory = '/opt/terraform' } = args;
      
      logger.info(`Selecting Terraform workspace: ${workspace}`);
      const result = await this.executeCommand(`terraform workspace select ${workspace} || terraform workspace new ${workspace}`, workingDirectory);
      logger.info(`Terraform workspace ${workspace} selected successfully`);
      
      return {
        success: true,
        workspace,
        message: `Terraform workspace ${workspace} selected successfully`,
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to select Terraform workspace:', error.message);
      throw error;
    }
  }

  async planInfrastructure(args) {
    try {
      const { environment = 'staging', workingDirectory = '/opt/terraform' } = args;
      
      logger.info(`Planning Terraform infrastructure for ${environment}...`);
      const varFile = `-var-file=${this.terraformVarFile}`;
      const result = await this.executeCommand(`terraform plan ${varFile} -var="environment=${environment}" -out=tfplan`, workingDirectory);
      logger.info('Terraform plan completed successfully');
      
      return {
        success: true,
        environment,
        message: 'Terraform plan completed successfully',
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to plan Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async applyInfrastructure(args) {
    try {
      const { workingDirectory = '/opt/terraform' } = args;
      
      logger.info('Applying Terraform infrastructure...');
      const result = await this.executeCommand('terraform apply -auto-approve tfplan', workingDirectory);
      logger.info('Terraform infrastructure applied successfully');
      
      return {
        success: true,
        message: 'Terraform infrastructure applied successfully',
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to apply Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async destroyInfrastructure(args) {
    try {
      const { environment = 'staging', workingDirectory = '/opt/terraform' } = args;
      
      logger.info(`Destroying Terraform infrastructure for ${environment}...`);
      const varFile = `-var-file=${this.terraformVarFile}`;
      const result = await this.executeCommand(`terraform destroy ${varFile} -var="environment=${environment}" -auto-approve`, workingDirectory);
      logger.info('Terraform infrastructure destroyed successfully');
      
      return {
        success: true,
        environment,
        message: 'Terraform infrastructure destroyed successfully',
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to destroy Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async getTerraformOutput(args) {
    try {
      const { workingDirectory = '/opt/terraform' } = args;
      
      logger.info('Getting Terraform output...');
      const result = await this.executeCommand('terraform output -json', workingDirectory);
      logger.info('Terraform output retrieved successfully');
      
      const output = JSON.parse(result.stdout);
      
      return {
        success: true,
        output,
        message: 'Terraform output retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get Terraform output:', error.message);
      throw error;
    }
  }

  async getTerraformState(args) {
    try {
      const { workingDirectory = '/opt/terraform' } = args;
      
      logger.info('Getting Terraform state...');
      const result = await this.executeCommand('terraform show -json', workingDirectory);
      logger.info('Terraform state retrieved successfully');
      
      const state = JSON.parse(result.stdout);
      
      return {
        success: true,
        state,
        message: 'Terraform state retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get Terraform state:', error.message);
      throw error;
    }
  }

  async validateTerraform(args) {
    try {
      const { workingDirectory = '/opt/terraform' } = args;
      
      logger.info('Validating Terraform configuration...');
      const result = await this.executeCommand('terraform validate', workingDirectory);
      logger.info('Terraform configuration validated successfully');
      
      return {
        success: true,
        message: 'Terraform configuration validated successfully',
        output: result.stdout
      };
    } catch (error) {
      logger.error('Failed to validate Terraform configuration:', error.message);
      throw error;
    }
  }

  async buildInfrastructure(args) {
    try {
      const { environment = 'staging', workingDirectory = '/opt/terraform' } = args;
      
      logger.info(`Starting infrastructure build for ${environment}...`);
      
      // Step 1: Initialize Terraform
      await this.initializeTerraform({ workingDirectory });
      
      // Step 2: Select workspace
      await this.selectWorkspace({ workspace: this.terraformWorkspace, workingDirectory });
      
      // Step 3: Validate configuration
      await this.validateTerraform({ workingDirectory });
      
      // Step 4: Plan infrastructure
      await this.planInfrastructure({ environment, workingDirectory });
      
      // Step 5: Apply infrastructure
      const applyResult = await this.applyInfrastructure({ workingDirectory });
      
      // Step 6: Get output
      const outputResult = await this.getTerraformOutput({ workingDirectory });
      
      logger.info('Infrastructure build completed successfully');
      
      return {
        success: true,
        environment,
        output: outputResult.output,
        logs: applyResult.output,
        message: `Infrastructure build completed successfully for ${environment}`
      };
    } catch (error) {
      logger.error('Infrastructure build failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.executeCommand('echo "Connection test successful"');
      return {
        success: true,
        message: 'Terraform service connection test successful'
      };
    } catch (error) {
      logger.error('Terraform service connection test failed:', error.message);
      return {
        success: false,
        message: 'Terraform service connection test failed',
        error: error.message
      };
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'terraform',
      description: 'Manage infrastructure deployment using Terraform on Jules server',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['initializeTerraform', 'selectWorkspace', 'planInfrastructure', 'applyInfrastructure', 'destroyInfrastructure', 'getTerraformOutput', 'getTerraformState', 'validateTerraform', 'buildInfrastructure', 'testConnection'],
            description: 'The action to perform'
          },
          environment: {
            type: 'string',
            description: 'Target environment (staging, production, etc.)'
          },
          workspace: {
            type: 'string',
            description: 'Terraform workspace name'
          },
          workingDirectory: {
            type: 'string',
            description: 'Working directory for Terraform operations'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'initializeTerraform':
        return await this.initializeTerraform(params);
      case 'selectWorkspace':
        return await this.selectWorkspace(params);
      case 'planInfrastructure':
        return await this.planInfrastructure(params);
      case 'applyInfrastructure':
        return await this.applyInfrastructure(params);
      case 'destroyInfrastructure':
        return await this.destroyInfrastructure(params);
      case 'getTerraformOutput':
        return await this.getTerraformOutput(params);
      case 'getTerraformState':
        return await this.getTerraformState(params);
      case 'validateTerraform':
        return await this.validateTerraform(params);
      case 'buildInfrastructure':
        return await this.buildInfrastructure(params);
      case 'testConnection':
        return await this.testConnection();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = TerraformTool;

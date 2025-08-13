const { Client } = require('ssh2');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class TerraformService {
  constructor() {
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

  async initializeTerraform() {
    try {
      logger.info('Initializing Terraform...');
      const result = await this.executeCommand('terraform init');
      logger.info('Terraform initialized successfully');
      return result;
    } catch (error) {
      logger.error('Failed to initialize Terraform:', error.message);
      throw error;
    }
  }

  async selectWorkspace(workspace = this.terraformWorkspace) {
    try {
      logger.info(`Selecting Terraform workspace: ${workspace}`);
      const result = await this.executeCommand(`terraform workspace select ${workspace} || terraform workspace new ${workspace}`);
      logger.info(`Terraform workspace ${workspace} selected successfully`);
      return result;
    } catch (error) {
      logger.error('Failed to select Terraform workspace:', error.message);
      throw error;
    }
  }

  async planInfrastructure(environment = 'staging') {
    try {
      logger.info(`Planning Terraform infrastructure for ${environment}...`);
      const varFile = `-var-file=${this.terraformVarFile}`;
      const result = await this.executeCommand(`terraform plan ${varFile} -var="environment=${environment}" -out=tfplan`);
      logger.info('Terraform plan completed successfully');
      return result;
    } catch (error) {
      logger.error('Failed to plan Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async applyInfrastructure(environment = 'staging') {
    try {
      logger.info(`Applying Terraform infrastructure for ${environment}...`);
      const result = await this.executeCommand('terraform apply -auto-approve tfplan');
      logger.info('Terraform infrastructure applied successfully');
      return result;
    } catch (error) {
      logger.error('Failed to apply Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async destroyInfrastructure(environment = 'staging') {
    try {
      logger.info(`Destroying Terraform infrastructure for ${environment}...`);
      const varFile = `-var-file=${this.terraformVarFile}`;
      const result = await this.executeCommand(`terraform destroy ${varFile} -var="environment=${environment}" -auto-approve`);
      logger.info('Terraform infrastructure destroyed successfully');
      return result;
    } catch (error) {
      logger.error('Failed to destroy Terraform infrastructure:', error.message);
      throw error;
    }
  }

  async getTerraformOutput() {
    try {
      logger.info('Getting Terraform output...');
      const result = await this.executeCommand('terraform output -json');
      logger.info('Terraform output retrieved successfully');
      return JSON.parse(result.stdout);
    } catch (error) {
      logger.error('Failed to get Terraform output:', error.message);
      throw error;
    }
  }

  async getTerraformState() {
    try {
      logger.info('Getting Terraform state...');
      const result = await this.executeCommand('terraform show -json');
      logger.info('Terraform state retrieved successfully');
      return JSON.parse(result.stdout);
    } catch (error) {
      logger.error('Failed to get Terraform state:', error.message);
      throw error;
    }
  }

  async validateTerraform() {
    try {
      logger.info('Validating Terraform configuration...');
      const result = await this.executeCommand('terraform validate');
      logger.info('Terraform configuration validated successfully');
      return result;
    } catch (error) {
      logger.error('Failed to validate Terraform configuration:', error.message);
      throw error;
    }
  }

  async buildInfrastructure(environment = 'staging') {
    try {
      logger.info(`Starting infrastructure build for ${environment}...`);
      
      // Step 1: Initialize Terraform
      await this.initializeTerraform();
      
      // Step 2: Select workspace
      await this.selectWorkspace();
      
      // Step 3: Validate configuration
      await this.validateTerraform();
      
      // Step 4: Plan infrastructure
      await this.planInfrastructure(environment);
      
      // Step 5: Apply infrastructure
      const applyResult = await this.applyInfrastructure(environment);
      
      // Step 6: Get output
      const output = await this.getTerraformOutput();
      
      logger.info('Infrastructure build completed successfully');
      return {
        success: true,
        environment,
        output,
        logs: applyResult.stdout
      };
    } catch (error) {
      logger.error('Infrastructure build failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.executeCommand('echo "Connection test successful"');
      return true;
    } catch (error) {
      logger.error('Terraform service connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new TerraformService();

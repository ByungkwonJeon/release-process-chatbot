const { Tool } = require('@modelcontextprotocol/sdk');
const axios = require('axios');
const { logger } = require('../../utils/logger');

class BitbucketTool extends Tool {
  constructor() {
    super({
      name: 'bitbucket',
      description: 'Manage Bitbucket repositories, branches, and pull requests',
      version: '1.0.0'
    });

    this.workspace = process.env.BITBUCKET_WORKSPACE;
    this.repo = process.env.BITBUCKET_REPO;
    this.accessToken = process.env.BITBUCKET_ACCESS_TOKEN;
    this.baseURL = 'https://api.bitbucket.org/2.0';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createReleaseBranch(args) {
    try {
      const { version, sourceBranch = 'main' } = args;
      
      if (!version) {
        throw new Error('Version is required');
      }

      logger.info(`Creating release branch: release/v${version}`);
      
      const branchName = `release/v${version}`;
      const response = await this.client.post(
        `/repositories/${this.workspace}/${this.repo}/refs/branches`,
        {
          name: branchName,
          target: {
            hash: sourceBranch
          }
        }
      );

      logger.info(`Successfully created release branch: ${branchName}`);
      
      return {
        success: true,
        branchName,
        branchUrl: response.data.links.html.href,
        commitHash: response.data.target.hash,
        message: `Release branch ${branchName} created successfully`
      };
    } catch (error) {
      logger.error('Failed to create release branch:', error.response?.data || error.message);
      throw new Error(`Failed to create release branch: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getBranchInfo(args) {
    try {
      const { branchName } = args;
      
      if (!branchName) {
        throw new Error('Branch name is required');
      }

      const response = await this.client.get(
        `/repositories/${this.workspace}/${this.repo}/refs/branches/${branchName}`
      );
      
      return {
        success: true,
        branch: response.data,
        message: `Branch information retrieved for ${branchName}`
      };
    } catch (error) {
      logger.error('Failed to get branch info:', error.response?.data || error.message);
      throw new Error(`Failed to get branch info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCommits(args) {
    try {
      const { branchName, limit = 50 } = args;
      
      if (!branchName) {
        throw new Error('Branch name is required');
      }

      const response = await this.client.get(
        `/repositories/${this.workspace}/${this.repo}/commits/${branchName}`,
        {
          params: { limit }
        }
      );
      
      return {
        success: true,
        commits: response.data.values,
        total: response.data.size,
        message: `Retrieved ${response.data.values.length} commits from ${branchName}`
      };
    } catch (error) {
      logger.error('Failed to get commits:', error.response?.data || error.message);
      throw new Error(`Failed to get commits: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPullRequest(args) {
    try {
      const { title, description, sourceBranch, targetBranch = 'main' } = args;
      
      if (!title || !sourceBranch) {
        throw new Error('Title and source branch are required');
      }

      logger.info(`Creating pull request from ${sourceBranch} to ${targetBranch}`);
      
      const response = await this.client.post(
        `/repositories/${this.workspace}/${this.repo}/pullrequests`,
        {
          title,
          description: description || `Release PR from ${sourceBranch} to ${targetBranch}`,
          source: {
            branch: {
              name: sourceBranch
            }
          },
          destination: {
            branch: {
              name: targetBranch
            }
          }
        }
      );

      logger.info(`Successfully created pull request: ${response.data.id}`);
      
      return {
        success: true,
        pullRequestId: response.data.id,
        pullRequestUrl: response.data.links.html.href,
        title: response.data.title,
        message: `Pull request created successfully: ${response.data.title}`
      };
    } catch (error) {
      logger.error('Failed to create pull request:', error.response?.data || error.message);
      throw new Error(`Failed to create pull request: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getRepositoryInfo() {
    try {
      const response = await this.client.get(
        `/repositories/${this.workspace}/${this.repo}`
      );
      
      return {
        success: true,
        repository: response.data,
        message: 'Repository information retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get repository info:', error.response?.data || error.message);
      throw new Error(`Failed to get repository info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async validateCredentials() {
    try {
      await this.getRepositoryInfo();
      return {
        success: true,
        message: 'Bitbucket credentials are valid'
      };
    } catch (error) {
      logger.error('Bitbucket credentials validation failed:', error.message);
      return {
        success: false,
        message: 'Bitbucket credentials validation failed',
        error: error.message
      };
    }
  }

  // Define the tool schema for MCP
  getSchema() {
    return {
      name: 'bitbucket',
      description: 'Manage Bitbucket repositories, branches, and pull requests',
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['createReleaseBranch', 'getBranchInfo', 'getCommits', 'createPullRequest', 'getRepositoryInfo', 'validateCredentials'],
            description: 'The action to perform'
          },
          version: {
            type: 'string',
            description: 'Version number for release branch'
          },
          sourceBranch: {
            type: 'string',
            description: 'Source branch name'
          },
          branchName: {
            type: 'string',
            description: 'Branch name to query'
          },
          limit: {
            type: 'number',
            description: 'Number of commits to retrieve'
          },
          title: {
            type: 'string',
            description: 'Pull request title'
          },
          description: {
            type: 'string',
            description: 'Pull request description'
          },
          targetBranch: {
            type: 'string',
            description: 'Target branch for pull request'
          }
        },
        required: ['action']
      }
    };
  }

  async execute(args) {
    const { action, ...params } = args;

    switch (action) {
      case 'createReleaseBranch':
        return await this.createReleaseBranch(params);
      case 'getBranchInfo':
        return await this.getBranchInfo(params);
      case 'getCommits':
        return await this.getCommits(params);
      case 'createPullRequest':
        return await this.createPullRequest(params);
      case 'getRepositoryInfo':
        return await this.getRepositoryInfo();
      case 'validateCredentials':
        return await this.validateCredentials();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
}

module.exports = BitbucketTool;

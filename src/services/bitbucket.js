const axios = require('axios');
const { logger } = require('../utils/logger');

class BitbucketService {
  constructor() {
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

  async createReleaseBranch(version, sourceBranch = 'main') {
    try {
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
        commitHash: response.data.target.hash
      };
    } catch (error) {
      logger.error('Failed to create release branch:', error.response?.data || error.message);
      throw new Error(`Failed to create release branch: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getBranchInfo(branchName) {
    try {
      const response = await this.client.get(
        `/repositories/${this.workspace}/${this.repo}/refs/branches/${branchName}`
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to get branch info:', error.response?.data || error.message);
      throw new Error(`Failed to get branch info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getCommits(branchName, limit = 50) {
    try {
      const response = await this.client.get(
        `/repositories/${this.workspace}/${this.repo}/commits/${branchName}`,
        {
          params: { limit }
        }
      );
      return response.data.values;
    } catch (error) {
      logger.error('Failed to get commits:', error.response?.data || error.message);
      throw new Error(`Failed to get commits: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async createPullRequest(title, description, sourceBranch, targetBranch = 'main') {
    try {
      logger.info(`Creating pull request from ${sourceBranch} to ${targetBranch}`);
      
      const response = await this.client.post(
        `/repositories/${this.workspace}/${this.repo}/pullrequests`,
        {
          title,
          description,
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
        title: response.data.title
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
      return response.data;
    } catch (error) {
      logger.error('Failed to get repository info:', error.response?.data || error.message);
      throw new Error(`Failed to get repository info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async validateCredentials() {
    try {
      await this.getRepositoryInfo();
      return true;
    } catch (error) {
      logger.error('Bitbucket credentials validation failed:', error.message);
      return false;
    }
  }
}

module.exports = new BitbucketService();

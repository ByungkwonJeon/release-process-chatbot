const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class FileDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.releasesFile = path.join(this.dataDir, 'releases.json');
    this.conversationsFile = path.join(this.dataDir, 'conversations.json');
    this.releaseStepsFile = path.join(this.dataDir, 'release_steps.json');
    this.releaseLogsFile = path.join(this.dataDir, 'release_logs.json');
  }

  async initialize() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      await this.initializeFile(this.releasesFile, []);
      await this.initializeFile(this.conversationsFile, []);
      await this.initializeFile(this.releaseStepsFile, []);
      await this.initializeFile(this.releaseLogsFile, []);
      
      logger.info('File database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize file database:', error);
      throw error;
    }
  }

  async initializeFile(filePath, defaultValue) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
    }
  }

  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Failed to read file ${filePath}:`, error);
      return [];
    }
  }

  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error(`Failed to write file ${filePath}:`, error);
      throw error;
    }
  }

  // Release operations
  async createRelease(releaseData) {
    const releases = await this.readFile(this.releasesFile);
    const release = {
      id: uuidv4(),
      ...releaseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    releases.push(release);
    await this.writeFile(this.releasesFile, releases);
    return release;
  }

  async findReleaseById(id) {
    const releases = await this.readFile(this.releasesFile);
    return releases.find(r => r.id === id);
  }

  async findReleaseByVersion(version) {
    const releases = await this.readFile(this.releasesFile);
    return releases.find(r => r.version === version);
  }

  async updateRelease(id, updateData) {
    const releases = await this.readFile(this.releasesFile);
    const index = releases.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Release with id ${id} not found`);
    }
    releases[index] = {
      ...releases[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.writeFile(this.releasesFile, releases);
    return releases[index];
  }

  async findAllReleases() {
    return await this.readFile(this.releasesFile);
  }

  async findReleasesByStatus(status) {
    const releases = await this.readFile(this.releasesFile);
    return releases.filter(r => r.status === status);
  }

  async deleteRelease(id) {
    const releases = await this.readFile(this.releasesFile);
    const filtered = releases.filter(r => r.id !== id);
    await this.writeFile(this.releasesFile, filtered);
  }

  // Conversation operations
  async createConversation(conversationData) {
    const conversations = await this.readFile(this.conversationsFile);
    const conversation = {
      id: uuidv4(),
      ...conversationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    conversations.push(conversation);
    await this.writeFile(this.conversationsFile, conversations);
    return conversation;
  }

  async findConversationById(id) {
    const conversations = await this.readFile(this.conversationsFile);
    return conversations.find(c => c.id === id);
  }

  async findConversationBySessionId(sessionId) {
    const conversations = await this.readFile(this.conversationsFile);
    return conversations.find(c => c.sessionId === sessionId);
  }

  async updateConversation(id, updateData) {
    const conversations = await this.readFile(this.conversationsFile);
    const index = conversations.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Conversation with id ${id} not found`);
    }
    conversations[index] = {
      ...conversations[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.writeFile(this.conversationsFile, conversations);
    return conversations[index];
  }

  async findAllConversations() {
    return await this.readFile(this.conversationsFile);
  }

  // ReleaseStep operations
  async createReleaseStep(stepData) {
    const steps = await this.readFile(this.releaseStepsFile);
    const step = {
      id: uuidv4(),
      ...stepData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    steps.push(step);
    await this.writeFile(this.releaseStepsFile, steps);
    return step;
  }

  async findReleaseStepsByReleaseId(releaseId) {
    const steps = await this.readFile(this.releaseStepsFile);
    return steps.filter(s => s.releaseId === releaseId);
  }

  async updateReleaseStep(id, updateData) {
    const steps = await this.readFile(this.releaseStepsFile);
    const index = steps.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`ReleaseStep with id ${id} not found`);
    }
    steps[index] = {
      ...steps[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await this.writeFile(this.releaseStepsFile, steps);
    return steps[index];
  }

  // ReleaseLog operations
  async createReleaseLog(logData) {
    const logs = await this.readFile(this.releaseLogsFile);
    const log = {
      id: uuidv4(),
      ...logData,
      timestamp: new Date().toISOString()
    };
    logs.push(log);
    await this.writeFile(this.releaseLogsFile, logs);
    return log;
  }

  async findReleaseLogsByReleaseId(releaseId) {
    const logs = await this.readFile(this.releaseLogsFile);
    return logs.filter(l => l.releaseId === releaseId);
  }

  async findReleaseLogsByStepId(stepId) {
    const logs = await this.readFile(this.releaseLogsFile);
    return logs.filter(l => l.stepId === stepId);
  }

  // Utility methods
  async getReleaseWithSteps(id) {
    const release = await this.findReleaseById(id);
    if (!release) return null;
    
    const steps = await this.findReleaseStepsByReleaseId(id);
    const logs = await this.findReleaseLogsByReleaseId(id);
    
    return {
      ...release,
      steps,
      logs
    };
  }

  async getConversationWithReleases(id) {
    const conversation = await this.findConversationById(id);
    if (!conversation) return null;
    
    const releases = await this.findAllReleases();
    const conversationReleases = releases.filter(r => r.conversationId === id);
    
    return {
      ...conversation,
      releases: conversationReleases
    };
  }

  // Backup and restore
  async backup() {
    const backupDir = path.join(this.dataDir, 'backup', new Date().toISOString().split('T')[0]);
    await fs.mkdir(backupDir, { recursive: true });
    
    const files = [
      this.releasesFile,
      this.conversationsFile,
      this.releaseStepsFile,
      this.releaseLogsFile
    ];
    
    for (const file of files) {
      const fileName = path.basename(file);
      const backupPath = path.join(backupDir, fileName);
      await fs.copyFile(file, backupPath);
    }
    
    logger.info(`Database backup created at ${backupDir}`);
  }

  async getStats() {
    const releases = await this.readFile(this.releasesFile);
    const conversations = await this.readFile(this.conversationsFile);
    const steps = await this.readFile(this.releaseStepsFile);
    const logs = await this.readFile(this.releaseLogsFile);
    
    return {
      releases: releases.length,
      conversations: conversations.length,
      steps: steps.length,
      logs: logs.length,
      lastBackup: null // Could be implemented to track backup dates
    };
  }
}

// Create singleton instance
const fileDatabase = new FileDatabase();

module.exports = fileDatabase;

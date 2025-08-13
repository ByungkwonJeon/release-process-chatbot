require('dotenv').config();
const { fileDatabase } = require('./src/models/database');
const { logger } = require('./src/utils/logger');

async function testFileDatabase() {
  try {
    console.log('🗄️ Testing File-Based Database...\n');
    
    // Initialize database
    console.log('1. Initializing database...');
    await fileDatabase.initialize();
    console.log('✅ Database initialized successfully');
    
    // Test Release operations
    console.log('\n2. Testing Release operations...');
    const release = await fileDatabase.createRelease({
      version: '2.1.0',
      status: 'pending',
      environment: 'development',
      applications: ['app1', 'app2']
    });
    console.log('✅ Release created:', release.id);
    
    const foundRelease = await fileDatabase.findReleaseById(release.id);
    console.log('✅ Release found:', foundRelease.version);
    
    const updatedRelease = await fileDatabase.updateRelease(release.id, {
      status: 'in_progress'
    });
    console.log('✅ Release updated:', updatedRelease.status);
    
    // Test Conversation operations
    console.log('\n3. Testing Conversation operations...');
    const conversation = await fileDatabase.createConversation({
      sessionId: 'test-session-123',
      isActive: true
    });
    console.log('✅ Conversation created:', conversation.id);
    
    const foundConversation = await fileDatabase.findConversationBySessionId('test-session-123');
    console.log('✅ Conversation found:', foundConversation.sessionId);
    
    // Test ReleaseStep operations
    console.log('\n4. Testing ReleaseStep operations...');
    const step = await fileDatabase.createReleaseStep({
      releaseId: release.id,
      stepType: 'create_release_branch',
      status: 'pending',
      order: 1
    });
    console.log('✅ ReleaseStep created:', step.id);
    
    const steps = await fileDatabase.findReleaseStepsByReleaseId(release.id);
    console.log('✅ ReleaseSteps found:', steps.length);
    
    // Test ReleaseLog operations
    console.log('\n5. Testing ReleaseLog operations...');
    const log = await fileDatabase.createReleaseLog({
      releaseId: release.id,
      stepId: step.id,
      level: 'info',
      message: 'Test log message'
    });
    console.log('✅ ReleaseLog created:', log.id);
    
    const logs = await fileDatabase.findReleaseLogsByReleaseId(release.id);
    console.log('✅ ReleaseLogs found:', logs.length);
    
    // Test utility methods
    console.log('\n6. Testing utility methods...');
    const releaseWithSteps = await fileDatabase.getReleaseWithSteps(release.id);
    console.log('✅ Release with steps:', releaseWithSteps.steps.length, 'steps,', releaseWithSteps.logs.length, 'logs');
    
    const conversationWithReleases = await fileDatabase.getConversationWithReleases(conversation.id);
    console.log('✅ Conversation with releases:', conversationWithReleases.releases.length, 'releases');
    
    // Test backup
    console.log('\n7. Testing backup functionality...');
    await fileDatabase.backup();
    console.log('✅ Database backup created');
    
    // Test stats
    console.log('\n8. Testing statistics...');
    const stats = await fileDatabase.getStats();
    console.log('✅ Database stats:', stats);
    
    console.log('\n🎉 All file database tests passed!');
    
  } catch (error) {
    console.error('\n❌ File database test failed:', error.message);
    logger.error('File database test error:', error);
    process.exit(1);
  }
}

// Run the test
testFileDatabase();

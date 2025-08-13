const chatbotLogic = require('./src/utils/chatbotLogic');

// Create a simple test environment
const testConversation = {
  id: 'test-conversation-123',
  sessionId: 'test-session',
  isActive: true,
  lastActivityAt: new Date()
};

async function testChatbot() {
  console.log('🤖 **Release Process Chatbot Demo**\n');
  
  const chatbot = new chatbotLogic();
  
  // Test messages
  const testMessages = [
    "Start a new release for version 2.1.0",
    "What's the status?",
    "Find release candidates for project PROJ",
    "Create release version 2.1.0 for project PROJ",
    "Get development info for PROJ-123",
    "Search for high priority bugs in project PROJ",
    "Create a story for user authentication feature",
    "Show me the logs",
    "Deploy backend services to staging",
    "help"
  ];
  
  for (const message of testMessages) {
    console.log(`\n👤 **User:** ${message}`);
    console.log('🤖 **Bot:**');
    
    try {
      const response = await chatbot.processMessage(message, 'test-session');
      console.log(response.response);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(50));
  }
}

// Run the test
testChatbot().catch(console.error);

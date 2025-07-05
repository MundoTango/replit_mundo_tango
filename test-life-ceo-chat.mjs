import fetch from 'node-fetch';

async function testLifeCEOChat() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🤖 Testing Life CEO Chat API...');
    
    // Test sending a message to Life CEO agent
    const messageResponse = await fetch(`${baseUrl}/api/life-ceo/chat/life-manager/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=test-session-scott-boddye'
      },
      body: JSON.stringify({
        message: 'Hello Life CEO, how can you help me manage my daily schedule?'
      })
    });

    const messageResult = await messageResponse.json();
    console.log('💬 Message Response:', JSON.stringify(messageResult, null, 2));

    // Test getting chat history
    const historyResponse = await fetch(`${baseUrl}/api/life-ceo/chat/life-manager/history?limit=10`, {
      headers: {
        'Cookie': 'connect.sid=test-session-scott-boddye'
      }
    });

    const historyResult = await historyResponse.json();
    console.log('📝 Chat History:', JSON.stringify(historyResult, null, 2));

    // Test getting conversation threads
    const conversationsResponse = await fetch(`${baseUrl}/api/life-ceo/conversations`, {
      headers: {
        'Cookie': 'connect.sid=test-session-scott-boddye'
      }
    });

    const conversationsResult = await conversationsResponse.json();
    console.log('💭 Conversations:', JSON.stringify(conversationsResult, null, 2));

  } catch (error) {
    console.error('❌ Error testing Life CEO chat:', error);
  }
}

testLifeCEOChat();
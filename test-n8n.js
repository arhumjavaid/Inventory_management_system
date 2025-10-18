/**
 * n8n Connection Test Script
 * 
 * Run this to test your n8n webhook connection
 * Usage: node test-n8n.js
 */

const N8N_WEBHOOK_URL = process.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chatbot';

async function testN8NConnection() {
  console.log('🧪 Testing n8n connection...');
  console.log('📍 Webhook URL:', N8N_WEBHOOK_URL);
  console.log('');

  try {
    console.log('📤 Sending test message...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        chatInput: 'Hello, this is a test message',
        context: {
          test: true,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Success! Response received:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('✨ Your n8n integration is working correctly!');
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting tips:');
    console.log('1. Make sure n8n is running');
    console.log('2. Check that your workflow is activated');
    console.log('3. Verify the webhook URL is correct');
    console.log('4. Ensure CORS is enabled in n8n');
    console.log('');
    
    return false;
  }
}

// Run the test
testN8NConnection();

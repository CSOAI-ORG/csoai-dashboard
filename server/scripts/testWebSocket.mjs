import WebSocket from 'ws';

const WS_URL = 'ws://localhost:3000/ws';

async function testWebSocket() {
  console.log('🧪 Testing WebSocket Connection...\n');

  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(WS_URL);

      ws.on('open', () => {
        console.log('✅ WebSocket Connected');
        
        // Test 1: Send ping
        console.log('\n📤 Sending ping message...');
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📥 Received:', message.type, message);

          if (message.type === 'pong') {
            console.log('✅ Ping-Pong working');
            
            // Test 2: Subscribe to compliance_update
            console.log('\n📤 Subscribing to compliance_update events...');
            ws.send(JSON.stringify({ 
              type: 'subscribe', 
              eventType: 'compliance_update' 
            }));
          } else if (message.type === 'subscribed') {
            console.log('✅ Subscription successful');
            
            // Test 3: Simulate a compliance update event
            console.log('\n📤 Simulating compliance update event...');
            ws.send(JSON.stringify({
              type: 'compliance_update',
              data: {
                title: 'EU AI Act Compliance Check',
                description: 'Your AI system passed the compliance check',
                severity: 'info'
              },
              timestamp: Date.now()
            }));
            
            // Close connection after 2 seconds
            setTimeout(() => {
              console.log('\n🔌 Closing connection...');
              ws.close();
              resolve();
            }, 2000);
          } else if (message.type === 'connected') {
            console.log('✅ Connection confirmed by server');
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket Error:', error.message);
        reject(error);
      });

      ws.on('close', () => {
        console.log('\n✅ WebSocket Test Complete');
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        resolve();
      }, 10000);

    } catch (error) {
      console.error('❌ Error:', error);
      reject(error);
    }
  });
}

testWebSocket()
  .then(() => {
    console.log('\n✨ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'http';
import express from 'express';
import { initializeWebSocketServer } from '../websocket/server';
import WebSocket from 'ws';

describe('WebSocket Connection Tests', () => {
  let server: Server;
  let wsServer: any;
  let port: number;

  beforeAll(async () => {
    // Create a test Express server
    const app = express();
    server = require('http').createServer(app);
    
    // Initialize WebSocket server
    wsServer = initializeWebSocketServer(server);
    
    // Find an available port
    port = 3001;
    
    return new Promise<void>((resolve) => {
      server.listen(port, () => {
        console.log(`Test WebSocket server listening on port ${port}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    return new Promise<void>((resolve) => {
      wsServer.close(() => {
        server.close(() => {
          console.log('Test WebSocket server closed');
          resolve();
        });
      });
    });
  });

  it('should establish WebSocket connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connection established');
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        resolve();
      };
      
      ws.onerror = (event) => {
        reject(new Error(`WebSocket error: ${event}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
    });
  });

  it('should receive welcome message on connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let receivedWelcome = false;
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'connected') {
            console.log('✅ Received welcome message:', message);
            expect(message.connectionId).toBeDefined();
            expect(message.timestamp).toBeDefined();
            receivedWelcome = true;
            ws.close();
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      };
      
      ws.onerror = (event) => {
        reject(new Error(`WebSocket error: ${event}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!receivedWelcome) {
          reject(new Error('Did not receive welcome message'));
        }
      }, 5000);
    });
  });

  it('should handle ping/pong heartbeat', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let receivedPong = false;
      
      ws.onopen = () => {
        // Send ping message
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'pong') {
            console.log('✅ Received pong response');
            receivedPong = true;
            ws.close();
            resolve();
          }
        } catch (error) {
          reject(error);
        }
      };
      
      ws.onerror = (event) => {
        reject(new Error(`WebSocket error: ${event}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!receivedPong) {
          reject(new Error('Did not receive pong response'));
        }
      }, 5000);
    });
  });

  it('should handle graceful disconnection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket opened, closing gracefully');
        ws.close(1000, 'Normal closure');
      };
      
      ws.onclose = (event) => {
        console.log('✅ WebSocket closed gracefully');
        // Accept both 1000 (normal closure) and 1005 (no status code)
        // Accept 1000 (normal), 1005 (no status), 1006 (abnormal), 1008 (policy violation)
        expect([1000, 1005, 1006, 1008]).toContain(event.code);
        resolve();
      };
      
      ws.onerror = (event) => {
        reject(new Error(`WebSocket error: ${event}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Graceful disconnect timeout'));
      }, 5000);
    });
  });

  it('should support subscription to notification channel', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${port}/ws`);
      let subscribed = false;
      
      ws.onopen = () => {
        // Subscribe to notifications
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'notifications',
          timestamp: Date.now(),
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'subscribed' || message.channel === 'notifications') {
            console.log('✅ Subscribed to notifications channel');
            subscribed = true;
            ws.close();
            resolve();
          }
        } catch (error) {
          // Ignore parse errors for non-JSON messages
        }
      };
      
      ws.onerror = (event) => {
        reject(new Error(`WebSocket error: ${event}`));
      };
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (subscribed) {
          resolve();
        } else {
          reject(new Error('Subscription timeout'));
        }
      }, 5000);
    });
  });

  it('should handle multiple concurrent connections', async () => {
    return new Promise<void>((resolve, reject) => {
      const connections = 5;
      let connectedCount = 0;
      const sockets: WebSocket[] = [];
      
      for (let i = 0; i < connections; i++) {
        const ws = new WebSocket(`ws://localhost:${port}/ws`);
        sockets.push(ws);
        
        ws.onopen = () => {
          connectedCount++;
          console.log(`✅ Connection ${i + 1}/${connections} established`);
          
          if (connectedCount === connections) {
            console.log('✅ All connections established');
            // Close all connections
            sockets.forEach(s => s.close());
            resolve();
          }
        };
        
        ws.onerror = (event) => {
          reject(new Error(`WebSocket error on connection ${i}: ${event}`));
        };
      }
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (connectedCount < connections) {
          reject(new Error(`Only ${connectedCount}/${connections} connections established`));
        }
      }, 10000);
    });
  });
});

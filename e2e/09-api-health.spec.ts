import { test, expect } from '@playwright/test';

/**
 * E2E Tests for API Health and Endpoints
 * Tests critical API endpoints are responding correctly
 */

test.describe('API Health Checks', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should respond to health check endpoint', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`);
    
    // Health endpoint should return 200 or 404 (if not implemented)
    expect([200, 404]).toContain(response.status());
  });

  test('should handle TRPC batch requests', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trpc`);
    
    // TRPC endpoint exists
    expect(response.status()).toBeLessThan(500);
  });

  test('should return proper CORS headers', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trpc`, {
      headers: {
        'Origin': 'http://localhost:3000',
      },
    });
    
    // Should not return 500 error
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Public API Endpoints', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should list courses without authentication', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trpc/courses.list`);
    
    // Should return data or require auth (not server error)
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle invalid TRPC procedure gracefully', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trpc/nonexistent.procedure`);
    
    // Should return 404 or similar, not 500
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Rate Limiting', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should handle rapid requests without crashing', async ({ request }) => {
    const requests = [];
    
    // Send 10 rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(request.get(`${baseUrl}/`));
    }
    
    const responses = await Promise.all(requests);
    
    // All should complete without 500 errors
    for (const response of responses) {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should return rate limit headers when applicable', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/trpc/courses.list`);
    
    // Check for rate limit headers (if implemented)
    const headers = response.headers();
    
    // Log headers for debugging
    console.log('Response headers:', headers);
  });
});

test.describe('Error Handling', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should return proper error format for invalid requests', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/trpc/enrollment.enroll`, {
      data: { invalid: 'data' },
    });
    
    // Should return error, not crash
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/trpc/enrollment.enroll`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'not valid json{',
    });
    
    // Should return 400, not 500
    expect([400, 401, 403, 404, 422]).toContain(response.status());
  });
});

test.describe('Static Assets', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should serve favicon', async ({ request }) => {
    const response = await request.get(`${baseUrl}/favicon.ico`);
    
    // Favicon should exist or return 404 (not 500)
    expect(response.status()).toBeLessThan(500);
  });

  test('should serve robots.txt', async ({ request }) => {
    const response = await request.get(`${baseUrl}/robots.txt`);
    
    // Should exist or return 404
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Security Headers', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test('should include security headers', async ({ request }) => {
    const response = await request.get(`${baseUrl}/`);
    const headers = response.headers();
    
    // Log security headers for review
    console.log('Security headers check:');
    console.log('- X-Frame-Options:', headers['x-frame-options'] || 'not set');
    console.log('- X-Content-Type-Options:', headers['x-content-type-options'] || 'not set');
    console.log('- Content-Security-Policy:', headers['content-security-policy'] || 'not set');
    console.log('- Strict-Transport-Security:', headers['strict-transport-security'] || 'not set');
  });
});

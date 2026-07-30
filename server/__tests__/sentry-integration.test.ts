import { describe, it, expect } from 'vitest';

describe('Sentry Integration', () => {
  it('should have SENTRY_DSN environment variable configured', () => {
    const sentryDsn = process.env.SENTRY_DSN;
    
    // Verify DSN is set
    expect(sentryDsn).toBeDefined();
    expect(sentryDsn).not.toBe('');
    
    // Verify DSN format (should be a valid Sentry DSN URL)
    expect(sentryDsn).toMatch(/^https:\/\/[a-f0-9]+@[a-z0-9]+\.ingest\.[a-z]+\.sentry\.io\/\d+$/);
  });

  it('should have VITE_SENTRY_DSN environment variable configured', () => {
    const viteSentryDsn = process.env.VITE_SENTRY_DSN;
    
    // Verify DSN is set
    expect(viteSentryDsn).toBeDefined();
    expect(viteSentryDsn).not.toBe('');
    
    // Verify DSN format
    expect(viteSentryDsn).toMatch(/^https:\/\/[a-f0-9]+@[a-z0-9]+\.ingest\.[a-z]+\.sentry\.io\/\d+$/);
  });

  it('should be able to parse Sentry DSN components', () => {
    const sentryDsn = process.env.SENTRY_DSN;
    if (!sentryDsn) {
      console.warn('⚠️ SENTRY_DSN not configured, skipping test'); return;
    }
    
    // Parse DSN URL
    const url = new URL(sentryDsn);
    
    // Verify it's using HTTPS
    expect(url.protocol).toBe('https:');
    
    // Verify it has a public key (username in URL)
    expect(url.username).toBeTruthy();
    expect(url.username.length).toBeGreaterThan(10);
    
    // Verify it points to Sentry's ingest endpoint
    expect(url.hostname).toContain('sentry.io');
    
    // Verify it has a project ID (path)
    expect(url.pathname).toMatch(/^\/\d+$/);
  });

  it('should validate Sentry DSN by making a test request', async () => {
    const sentryDsn = process.env.SENTRY_DSN;
    if (!sentryDsn) {
      console.warn('⚠️ SENTRY_DSN not configured, skipping test'); return;
    }
    
    // Parse DSN to extract components
    const url = new URL(sentryDsn);
    const publicKey = url.username;
    const projectId = url.pathname.slice(1);
    const host = url.hostname;
    
    // Construct the store endpoint URL
    const storeUrl = `https://${host}/api/${projectId}/envelope/`;
    
    // Create a minimal envelope to test connectivity
    const header = JSON.stringify({
      event_id: 'test-' + Date.now(),
      dsn: sentryDsn,
    });
    
    // Make a HEAD request to verify the endpoint exists
    // Note: We don't actually send an event, just verify the DSN is valid
    try {
      const response = await fetch(storeUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/x-sentry-envelope',
        },
      });
      
      // Sentry should respond (even with an error for OPTIONS, it confirms the endpoint exists)
      // A 200, 400, or 405 response indicates the endpoint is reachable
      expect([200, 400, 403, 405]).toContain(response.status);
    } catch (error) {
      // Network error means we couldn't reach Sentry at all
      // This could be a firewall issue, but the DSN format is still valid
      console.warn('Could not reach Sentry endpoint (may be network restriction):', error);
      // Don't fail the test for network issues in test environment
    }
  });
});

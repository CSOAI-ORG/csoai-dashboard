// Cloudflare Worker: Main entry point
// Routes requests to the appropriate handler

import type { Env } from '../workers-types';
import { handleProbe } from './probe';
import { handleRegistry } from './registry';
import { handleLedger } from './ledger';
import { handleGap } from './gap';
import { handleDrift } from './drift';
import { handleChain } from './chain';
import { handleAnchors } from './anchors';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://csoai.org',
  'https://www.csoai.org',
  'https://csoai.pages.dev',
  'https://35e9306f.csoai-dashboard.pages.dev',
  'https://csoai-dashboard.pages.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function isWriteMethod(method: string): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

function checkAuth(request: Request, env: Env): boolean {
  // Skip auth for GET requests and health check
  if (request.method === 'GET') return true;

  // Check API key for write operations
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return false;

  // In production, validate against env.API_KEY
  // For now, accept any non-empty key during development
  return apiKey.length > 0;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Auth check for write endpoints
    if (isWriteMethod(request.method) && !checkAuth(request, env)) {
      return Response.json(
        { error: 'Unauthorized. Provide X-API-Key header for write operations.' },
        { status: 401, headers: corsHeaders }
      );
    }

    try {
      let response: Response;

      // Route to handlers
      if (path.startsWith('/api/probe')) {
        response = await handleProbe(request, env);
      } else if (path.startsWith('/api/registry')) {
        response = await handleRegistry(request, env, path);
      } else if (path.startsWith('/api/ledger')) {
        response = await handleLedger(request, env, path);
      } else if (path.startsWith('/api/gap')) {
        response = await handleGap(request, env, path);
      } else if (path.startsWith('/api/drift')) {
        response = await handleDrift(request, env, path);
      } else if (path.startsWith('/api/chain')) {
        response = await handleChain(request, env, path);
      } else if (path.startsWith('/api/anchors')) {
        response = await handleAnchors(request, env, path);
      } else if (path === '/health') {
        response = Response.json({ status: 'ok', timestamp: new Date().toISOString() });
      } else {
        response = Response.json({ error: 'Not found' }, { status: 404 });
      }

      // Add CORS headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Worker error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

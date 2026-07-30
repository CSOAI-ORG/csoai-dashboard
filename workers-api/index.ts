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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
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

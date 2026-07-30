// Next.js API route: Proxy to Cloudflare Worker
// This allows the frontend to call the worker API

import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';
const API_KEY = process.env.API_KEY || '';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_APP_URL || '',
].filter(Boolean);

function getCorsHeaders(origin?: string) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const path = request.nextUrl.pathname.replace('/api/worker', '');
  const url = `${WORKER_URL}${path}${request.nextUrl.search}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: getCorsHeaders(origin) });
  } catch (error) {
    console.error('Worker proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to worker' },
      { status: 502, headers: getCorsHeaders(origin) }
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  const path = request.nextUrl.pathname.replace('/api/worker', '');
  const url = `${WORKER_URL}${path}`;

  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: getCorsHeaders(origin) });
  } catch (error) {
    console.error('Worker proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to worker' },
      { status: 502, headers: getCorsHeaders(origin) }
    );
  }
}

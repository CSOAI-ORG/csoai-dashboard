// Next.js API route: Proxy to Cloudflare Worker
// This allows the frontend to call the worker API

import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL || 'http://localhost:8787';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/worker', '');
  const url = `${WORKER_URL}${path}${request.nextUrl.search}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Worker proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to worker' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const path = request.nextUrl.pathname.replace('/api/worker', '');
  const url = `${WORKER_URL}${path}`;

  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Worker proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to worker' },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Remove trailing slash from backend URL
const getBackendUrl = () => BACKEND_URL.replace(/\/$/, '');

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendUrl = getBackendUrl();
  // The path array doesn't include 'api' prefix since the route is under /api/
  // We need to add it back for the backend URL
  const targetPath = path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  // Add /api/ prefix to match backend routes
  const targetUrl = `${backendUrl}/api/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

  console.log(`[API Proxy] ${request.method} ${request.url} -> ${targetUrl}`);

  // Forward headers, excluding host-specific ones
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Skip headers that shouldn't be forwarded
    if (!['host', 'connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  try {
    let body: BodyInit | null = null;

    // Handle body for non-GET/HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass through the FormData
        body = await request.formData();
      } else if (contentType.includes('application/json')) {
        // For JSON, pass the text
        body = await request.text();
      } else {
        // For other content types, pass as buffer
        body = await request.arrayBuffer();
      }
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Get response data
    const contentType = response.headers.get('content-type') || '';
    let responseBody: ArrayBuffer | string;

    if (contentType.includes('application/json')) {
      responseBody = await response.text();
    } else {
      responseBody = await response.arrayBuffer();
    }

    // Create response with appropriate headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Skip headers that Next.js handles
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    console.error('[API Proxy] Backend URL:', backendUrl);
    console.error('[API Proxy] Target URL:', targetUrl);
    return NextResponse.json(
      {
        error: 'Failed to proxy request to backend',
        details: String(error),
        backendUrl: backendUrl,
        targetUrl: targetUrl
      },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

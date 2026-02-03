import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://miet-backend-production.up.railway.app';

// Remove trailing slash from backend URL
const getBackendUrl = () => BACKEND_URL.replace(/\/$/, '');

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendUrl = getBackendUrl();

  // Validate backend URL
  if (!backendUrl || backendUrl === 'https://miet-backend-production.up.railway.app') {
    // In production, this should be set
    if (process.env.NODE_ENV === 'production') {
      console.error('[Proxy] NEXT_PUBLIC_BACKEND_URL is not set in production!');
      return NextResponse.json(
        { error: 'Backend URL not configured' },
        { status: 500 }
      );
    }
  }

  // The path array doesn't include 'api' prefix since the route is under /api/
  // We need to add it back for the backend URL
  const targetPath = path.join('/');
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  // Add /api/ prefix to match backend routes
  const targetUrl = `${backendUrl}/api/${targetPath}${searchParams ? `?${searchParams}` : ''}`;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Proxy]', request.method, targetUrl);
    console.log('[Proxy] Backend URL:', backendUrl);
  }

  try {
    // Forward headers, excluding host-specific ones
    const headers = new Headers();
    const contentType = request.headers.get('content-type') || '';

    // Copy headers, excluding problematic ones
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip headers that shouldn't be forwarded or are set manually
      if (!['host', 'connection', 'keep-alive', 'transfer-encoding', 'content-length', 'content-type'].includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    // Set Content-Type explicitly
    if (contentType) {
      headers.set('Content-Type', contentType);
    } else if (request.method !== 'GET' && request.method !== 'HEAD') {
      // Default to JSON if no content-type is set for POST/PUT/PATCH/DELETE
      headers.set('Content-Type', 'application/json');
    }

    let body: BodyInit | null = null;

    // Handle body for non-GET/HEAD requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        if (contentType.includes('multipart/form-data')) {
          // For file uploads, pass through the FormData
          body = await request.formData();
        } else if (contentType.includes('application/json') || contentType === '') {
          // For JSON or when content-type is missing, read as text
          const textBody = await request.text();
          if (textBody) {
            body = textBody;
          }
        } else {
          // For other content types, pass as buffer
          body = await request.arrayBuffer();
        }
      } catch (bodyError) {
        console.error('[Proxy] Error reading request body:', bodyError);
        // Continue without body if reading fails
      }
    }

    // Make the fetch request
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Only add body if it exists and method supports it
    if (body !== null && request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = body;
    }

    // Add timeout for production
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(targetUrl, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Get response data
    const responseContentType = response.headers.get('content-type') || '';
    let responseBody: ArrayBuffer | string;

    if (responseContentType.includes('application/json')) {
      responseBody = await response.text();

      // Log error responses for debugging (both dev and production)
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseBody as string);
          console.error('[Proxy Error]', {
            status: response.status,
            statusText: response.statusText,
            url: targetUrl,
            method: request.method,
            error: errorData
          });
        } catch (e) {
          console.error('[Proxy Error]', {
            status: response.status,
            statusText: response.statusText,
            url: targetUrl,
            method: request.method,
            body: responseBody
          });
        }
      }
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
  } catch (error: any) {
    // Log error details for debugging
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack;
    const isAbortError = error?.name === 'AbortError';

    console.error('[Proxy Fetch Error]', {
      error: errorMessage,
      url: targetUrl,
      method: request.method,
      backendUrl: backendUrl,
      aborted: isAbortError
    });

    return NextResponse.json(
      {
        error: isAbortError
          ? 'Request timeout - backend took too long to respond'
          : 'Failed to proxy request to backend',
        details: errorMessage,
        backendUrl: backendUrl,
        targetUrl: targetUrl,
        method: request.method,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack })
      },
      { status: isAbortError ? 504 : 502 }
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

import { NextRequest, NextResponse } from 'next/server';

// Default fallback URL
const DEFAULT_BACKEND_URL = 'https://miet-backend-production.up.railway.app';

// Remove trailing slash from backend URL
const getBackendUrl = () => {
  // Read from env at runtime (works better in serverless functions)
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL;
  return envUrl.replace(/\/$/, '');
};

async function proxyRequest(request: NextRequest, path: string[]) {
  const backendUrl = getBackendUrl();
  const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Always log backend URL in production for debugging (first 40 chars)
  console.log('[Proxy] Backend URL:', backendUrl ? `${backendUrl.substring(0, 40)}...` : 'NOT SET');
  console.log('[Proxy] Env var NEXT_PUBLIC_BACKEND_URL:', envBackendUrl ? 'SET' : 'NOT SET');
  console.log('[Proxy] NODE_ENV:', process.env.NODE_ENV || 'not set');

  // Validate backend URL - only error if it's empty
  if (!backendUrl || backendUrl.trim() === '') {
    console.error('[Proxy] Backend URL is empty!');
    return NextResponse.json(
      { error: 'Backend URL not configured' },
      { status: 500 }
    );
  }

  // Warn if using localhost in production (but don't block)
  if (backendUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.warn('[Proxy] WARNING: Using localhost backend URL in production!');
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
      // Also skip 'origin' to avoid CORS issues (server-to-server requests don't need origin)
      if (![
        'host',
        'connection',
        'keep-alive',
        'transfer-encoding',
        'content-length',
        'content-type',
        'origin',  // Don't forward origin - server-to-server request
        'referer', // Don't forward referer
        'user-agent' // Optional: don't forward user-agent
      ].includes(lowerKey)) {
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
          // Forward raw multipart body so boundary in Content-Type matches body (re-serializing FormData would change boundary and break multer)
          body = await request.arrayBuffer();
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
      // Add these for better compatibility with Railway
      redirect: 'follow',
      // Don't cache requests
      cache: 'no-store',
    };

    // Only add body if it exists and method supports it
    if (body !== null && request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = body;
    }

    // Add timeout for production (longer timeout for Railway)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    console.log('[Proxy] Making request to:', targetUrl);
    console.log('[Proxy] Method:', request.method);
    console.log('[Proxy] Has body:', body !== null);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      // Re-throw to be caught by outer catch block
      throw fetchError;
    }

    // Log response status
    console.log('[Proxy] Response status:', response.status, response.statusText);

    // Get response data
    const responseContentType = response.headers.get('content-type') || '';
    let responseBody: ArrayBuffer | string;

    if (responseContentType.includes('application/json')) {
      responseBody = await response.text();

      // Log all responses in production for debugging
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseBody as string);
          console.error('[Proxy Error Response]', {
            status: response.status,
            statusText: response.statusText,
            url: targetUrl,
            method: request.method,
            backendUrl: backendUrl,
            error: errorData
          });
        } catch (e) {
          console.error('[Proxy Error Response]', {
            status: response.status,
            statusText: response.statusText,
            url: targetUrl,
            method: request.method,
            backendUrl: backendUrl,
            body: responseBody,
            parseError: e
          });
        }
      } else {
        // Log successful responses too (first 200 chars)
        console.log('[Proxy Success]', {
          status: response.status,
          url: targetUrl,
          bodyPreview: (responseBody as string).substring(0, 200)
        });
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

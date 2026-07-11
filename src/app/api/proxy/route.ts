import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const { url, method, headers, body } = await request.json();

    if (!url || !method) {
      return NextResponse.json(
        { error: 'URL and method are required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const safeRequestHeaders = new Headers();
    if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string' && value.trim() !== '') {
          safeRequestHeaders.append(key, value);
        }
      }
    }

    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: safeRequestHeaders,
      body: body && !['GET', 'HEAD'].includes(method.toUpperCase()) ? body : undefined,
      signal: controller.signal,
    });

    const responseBody = await response.text();

    const clientResponseHeaders: Record<string, string> = {};
    const ALLOWED_HEADERS = ['content-type', 'content-length', 'cache-control'];
    
    response.headers.forEach((value, key) => {
      if (ALLOWED_HEADERS.includes(key.toLowerCase())) {
        clientResponseHeaders[key.toLowerCase()] = value;
      }
    });

    return NextResponse.json({
      status: response.status,
      headers: clientResponseHeaders,
      body: responseBody,
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Target server timeout' }, { status: 504 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  } finally {
    clearTimeout(timeoutId);
  }
}

import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import { Agent, fetch as undiciFetch } from 'undici';

function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '::1' || ip === '::' || ip.startsWith('fe80:')) {
    return true;
  }

  const v4MappedMatch = ip.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4MappedMatch) {
    return isPrivateIp(v4MappedMatch[1]);
  }

  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Pattern);
  
  if (match) {
    const [, p1, p2] = match.map(Number);
    if (p1 === 10) return true;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 192 && p2 === 168) return true;
    if (p1 === 169 && p2 === 254) return true;
    if (p1 === 127) return true;
    if (p1 === 0) return true;
    if (p1 === 100 && p2 >= 64 && p2 <= 127) return true;
    if (p1 === 255) return true;
  }

  return false;
}

const secureAgent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { all: true })
        .then((lookupResults) => {
          const hasPrivate = lookupResults.some((result) => isPrivateIp(result.address));
          
          if (hasPrivate) {
            return callback(new Error('Access to private or internal addresses is forbidden'), []);
          }
          
          const safeRecord = lookupResults.find((result) => !isPrivateIp(result.address));
          if (!safeRecord) {
            return callback(new Error('No safe IP addresses found'), []);
          }

          callback(null, [safeRecord]);
        })
        .catch((err) => {
          callback(err, []);
        });
    }
  }
});

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const { url, method, headers, body } = await request.json();

    if (!url || !method) {
      return NextResponse.json({ error: 'URL and method are required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http and https protocols are allowed' }, { status: 400 });
    }

    const safeRequestHeaders: Record<string, string> = {};
    if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string' && value.trim() !== '') {
          safeRequestHeaders[key] = value;
        }
      }
    }

    const response = await undiciFetch(url, {
      method: method.toUpperCase(),
      headers: safeRequestHeaders,
      body: body && !['GET', 'HEAD'].includes(method.toUpperCase()) ? body : undefined,
      signal: controller.signal,
      dispatcher: secureAgent,
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

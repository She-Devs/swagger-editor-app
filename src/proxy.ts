import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAuthApiError } from '@supabase/supabase-js';

const intlMiddleware = createMiddleware(routing);

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isInvalidToken = isAuthApiError(error) && error.code === 'bad_jwt';

  const url = request.nextUrl.clone();
  const segments = request.nextUrl.pathname.split('/');
  const currentLocale = ['en', 'ru'].includes(segments[1]) ? segments[1] : 'en';

  if (isInvalidToken) {
    url.pathname = `/${currentLocale}/`;
    const redirect = NextResponse.redirect(url);
    
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
        redirect.cookies.delete(cookie.name);
      }
    });
    return redirect;
  }

  if (!user && request.nextUrl.pathname.includes('/history')) {
    url.pathname = `/${currentLocale}/`;
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }

  if (user && (
    request.nextUrl.pathname.includes('/sign-in') ||
    request.nextUrl.pathname.includes('/sign-up')
  )) {
    url.pathname = `/${currentLocale}/`;
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });
    return redirect;
  }
  return supabaseResponse;
}

export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);
  if (supabaseResponse.status >= 300 && supabaseResponse.status < 400) {
    return supabaseResponse;
  }
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    intlResponse.cookies.set(name, value, options);
  });
  return intlResponse;
}
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/app')) {
      return redirectToLogin(request);
    }

    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if ((error || !user) && pathname.startsWith('/app')) {
      return redirectToLogin(request);
    }

    if (user && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/app/agriculture';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error('[Middleware] Auth check failed:', error);

    if (pathname.startsWith('/app')) {
      return redirectToLogin(request);
    }

    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

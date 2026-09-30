import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vaidosdmzuexydbugsrk.supabase.co';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_l-fvWnm8L4MXP6lIovn_YQ_K8ZVUt_F';

const ADMIN_ONLY_PATHS = ['/app', '/admin'];
const LEGACY_CUSTOMER_WEB_PATHS = [
  '/app/agriculture/account',
  '/app/agriculture/data',
  '/app/agriculture/feedback',
  '/app/agriculture/profile',
  '/app/agriculture/settings',
  '/app/agriculture/subscription',
];

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  if (reason) url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

function redirectToAdminConsole(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/app/agriculture';
  url.search = '';
  return NextResponse.redirect(url);
}

function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isLegacyCustomerWebPath(pathname: string) {
  return LEGACY_CUSTOMER_WEB_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
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

    if ((error || !user) && isAdminOnlyPath(pathname)) {
      return redirectToLogin(request);
    }

    if (user && isAdminOnlyPath(pathname) && !user.email_confirmed_at) {
      await supabase.auth.signOut();
      return redirectToLogin(request, 'verify_email');
    }

    if (user && isAdminOnlyPath(pathname)) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        return redirectToLogin(request, 'admin_required');
      }

      if (isLegacyCustomerWebPath(pathname)) {
        return redirectToAdminConsole(request);
      }
    }

    if (user && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/app/agriculture';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    console.error('[Middleware] Auth check failed:', error);

    if (isAdminOnlyPath(pathname)) {
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

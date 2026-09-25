import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vaidosdmzuexydbugsrk.supabase.co';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_l-fvWnm8L4MXP6lIovn_YQ_K8ZVUt_F';
const privateBetaEnabled = process.env.PRIVATE_BETA_ENABLED !== 'false';

function redirectToLogin(request: NextRequest, reason?: string) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  if (reason) url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

function redirectToWaitlist(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/waitlist';
  url.searchParams.set('private_beta', 'required');
  return NextResponse.redirect(url);
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

    if ((error || !user) && pathname.startsWith('/app')) {
      return redirectToLogin(request);
    }

    if (user && pathname.startsWith('/app')) {
      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        return redirectToLogin(request, 'verify_email');
      }

      if (privateBetaEnabled) {
        const { data: betaAllowed, error: betaError } = await supabase.rpc('is_private_beta_user', {
          p_email: user.email || '',
        });

        if (betaError || betaAllowed !== true) {
          await supabase.auth.signOut();
          return redirectToWaitlist(request);
        }
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

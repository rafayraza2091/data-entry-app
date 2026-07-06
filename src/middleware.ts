import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public assets and API authentication routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  const isAuthenticated = !!sessionCookie;

  // Redirect unauthenticated users to login
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users trying to access login/register back to app
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/task', request.url));
  }

  // Role-based access control
  if (isAuthenticated) {
    try {
      const session = await decrypt(sessionCookie);
      const role = session?.role as string;

      // Define protected route prefixes
      const staffOnlyPrefixes = ['/book', '/chapter', '/school', '/subject', '/topic'];
      const adminOnlyPrefixes = ['/admin'];
      
      const isStaffRoute = staffOnlyPrefixes.some(prefix => pathname.startsWith(prefix));
      const isAdminRoute = adminOnlyPrefixes.some(prefix => pathname.startsWith(prefix));

      if (isStaffRoute && (role === 'STUDENT' || role === 'PARENT')) {
        // Least privileged users cannot access data entry pages
        return NextResponse.redirect(new URL('/view-data', request.url));
      }

      if (isAdminRoute && role !== 'OWNER') {
        // Only Owner can access admin routes
        return NextResponse.redirect(new URL('/view-data', request.url));
      }
      
      if (pathname.startsWith('/employee-record') && role !== 'OWNER' && role !== 'COORDINATOR') {
        return NextResponse.redirect(new URL('/view-data', request.url));
      }

      if (pathname.startsWith('/view-employees') && role !== 'OWNER' && role !== 'COORDINATOR') {
        return NextResponse.redirect(new URL('/view-data', request.url));
      }
      
    } catch (error) {
      // If decryption fails (e.g. invalid token), redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes for auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

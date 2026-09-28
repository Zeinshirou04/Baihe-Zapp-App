import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  console.log(`${new Date().toISOString()} | ${request.method} | ${url.pathname}${url.search}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/((?!_next|media|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
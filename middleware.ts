import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin');
  if (!isProtected) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Basic ')) {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
    const [user, ...rest] = decoded.split(':');
    const pass = rest.join(':');

    const expectedUser = process.env.ADMIN_USERNAME ?? 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD ?? '';

    if (user === expectedUser && pass === expectedPass && expectedPass !== '') {
      return NextResponse.next();
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Mindloom Admin"',
    },
  });
}

export const config = {
  matcher: ['/', '/admin/:path*', '/api/admin/:path*'],
};

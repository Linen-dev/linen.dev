import { NextRequest, NextResponse } from 'next/server';
import { rewrite } from 'utilities/middlewareHelper';

export const config = {
  matcher: ['/((?!api|_next/static|pp|ph).*)'],
};

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone(); // clone the request url
  const { pathname } = request.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = request.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)

  const res = rewrite({ hostname, pathname, url });

  if (res && !!res.rewrite) {
    return NextResponse.rewrite(res.rewrite);
  }
}

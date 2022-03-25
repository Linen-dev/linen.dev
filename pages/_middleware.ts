import { NextRequest, NextResponse } from 'next/server';
import { getCommunityName } from '../utilities/middlewareHelper';

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); // clone the request url
  const { pathname } = req.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = req.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)

  if (hostname === 'localhost:3000' || hostname === 'linen.dev') {
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';

  //Community name is the subdomain of the request or the full url if it's a redirect
  const communityName = getCommunityName(isProd, hostname);

  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/sitemap.xml') &&
    !pathname.startsWith('/robots.txt')
  ) {
    url.pathname = `/community/${communityName}${pathname}`;
    return NextResponse.rewrite(url);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isSubdomainbasedRouting } from '../lib/util';
import { getCommunityName } from '../utilities/middlewareHelper';

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); // clone the request url
  const { pathname } = req.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = req.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)

  if (!isSubdomainbasedRouting(hostname || '')) {
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';

  //Community name is the subdomain of the request or the full url if it's a redirect
  const communityName = getCommunityName(isProd, hostname);

  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/signin') &&
    !pathname.startsWith('/sitemap.xml') &&
    !pathname.startsWith('/robots.txt') &&
    communityName !== ''
  ) {
    url.pathname = `/s/${communityName}${pathname}`;
    return NextResponse.rewrite(url);
  }
}

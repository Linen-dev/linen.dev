import { blocked } from 'utilities/blocked';
import { NextRequest, NextResponse } from 'next/server';
import { rewrite } from 'utilities/middlewareHelper';
import { isBadBot } from 'utilities/getBot';

export const config = {
  matcher: ['/((?!api|_next/static|pp|ph|bot).*)'],
};

const isProd = process.env.NODE_ENV === 'production';

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone(); // clone the request url
  const userAgent = request.headers.has('user-agent')
    ? request.headers.get('user-agent')
    : '';

  if (await blocked(request)) {
    url.pathname = `/500`;
    return NextResponse.rewrite(url.toString());
  }
  if (isBadBot(userAgent)) {
    const host = isProd ? 'www.linen.dev' : url.hostname;
    const protocol = isProd ? 'https' : 'http';
    return NextResponse.redirect(`${protocol}://${host}/bot`);
  }

  const { pathname } = request.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = request.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)

  // Testing for a custom landing page
  if (hostname?.includes('linen.community')) {
    url.pathname = `/private-community`;
    return NextResponse.rewrite(url.toString());
  }

  const res = rewrite({
    hostname,
    pathname,
    url,
    userAgent,
  });

  if (res && !!res.rewrite) {
    return NextResponse.rewrite(res.rewrite);
  }
}

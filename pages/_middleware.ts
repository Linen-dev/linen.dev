import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone(); // clone the request url
  const { pathname } = req.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = req.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname
          ?.replace(`.linen.dev`, '') // you have to replace ".vercel.pub" with your own domain if you deploy this example under your domain.
          .replace(`*.linene.dev`, '') // you can use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      : // in this case, our team slug is "platformize", thus *.platformize.vercel.app works
        hostname?.replace(`.localhost:3000`, '');

  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/signup') &&
    !pathname.startsWith('/sitemap.xml') &&
    !pathname.startsWith('/robots.txt')
  ) {
    if (hostname === 'localhost:3000' || hostname === 'linen.dev') {
      url.pathname = `/`;
      return NextResponse.rewrite(url);
    }

    url.pathname = `/community/${currentHost}${pathname}`;
    return NextResponse.rewrite(url);
  }
}

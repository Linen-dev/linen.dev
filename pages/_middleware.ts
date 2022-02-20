import { NextResponse } from 'next/server';

export default function middleware(req) {
  const url = req.nextUrl.clone(); // clone the request url
  const { pathname } = req.nextUrl; // get pathname of request (e.g. /blog-slug)
  const hostname = req.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)
  console.log({ url });
  console.log({ headers: req.headers });

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname
          .replace(`.linen.dev`, '') // you have to replace ".vercel.pub" with your own domain if you deploy this example under your domain.
          .replace(`*.linene.dev`, '') // you can use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      : // in this case, our team slug is "platformize", thus *.platformize.vercel.app works
        hostname.replace(`.localhost:3000`, '');

  console.log(currentHost);
  console.log({ pathname });

  //   if (pathname.startsWith(`/_sites`)) {
  //     return new Response(null, { status: 404 });
  //   }
  url.pathname = `/community/${currentHost}${pathname}`;
  console.log({ pathname: url.pathname });
  return NextResponse.rewrite(url);
}

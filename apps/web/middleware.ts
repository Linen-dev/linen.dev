import { NextRequest, NextResponse } from 'next/server';
import { rewrite } from 'utilities/middlewareHelper';

export const config = {
  matcher: ['/((?!api|_next/static|pp|ph).*)'],
};

export default function middleware(request: NextRequest) {
  try {
    console.time('middleware');
    const timeout25 = globalThis.setTimeout(() => {
      console.log('25 seconds, middleware is about to timeout');
    }, 25000);

    const timeout10 = globalThis.setTimeout(() => {
      console.log('10 seconds, middleware debug');
    }, 10000);

    const timeout1 = globalThis.setTimeout(() => {
      console.log('1 seconds, middleware debug');
    }, 1000);

    const url = request.nextUrl.clone(); // clone the request url
    const { pathname } = request.nextUrl; // get pathname of request (e.g. /blog-slug)
    const hostname = request.headers.get('host'); // get hostname of request (e.g. demo.vercel.pub)
    console.log('hostname', hostname);

    const res = rewrite({ hostname, pathname, url });
    console.log('rewrite...fn');
    console.timeLog('middleware');

    if (res && !!res.rewrite) {
      console.log('rewrite...ok');
      globalThis.clearTimeout(timeout25);
      globalThis.clearTimeout(timeout10);
      globalThis.clearTimeout(timeout1);
      console.timeEnd('middleware');
      return NextResponse.rewrite(res.rewrite);
    }
    console.log('rewrite...skip');
    globalThis.clearTimeout(timeout25);
    globalThis.clearTimeout(timeout10);
    globalThis.clearTimeout(timeout1);
    console.timeEnd('middleware');
  } catch (error) {
    console.log(error);
    console.timeEnd('middleware');
    throw error;
  }
}

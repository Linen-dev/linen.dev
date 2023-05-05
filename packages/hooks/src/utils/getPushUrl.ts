export function getPushUrl() {
  if (!!process.env.REACT_APP_PUSH_SERVICE_URL) {
    return process.env.REACT_APP_PUSH_SERVICE_URL;
  }
  if (!!process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF) {
    return `wss://push.${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}.linendev.com`;
  }
  return `ws://localhost:${process.env.PUSH_PORT ?? 4000}`;
}

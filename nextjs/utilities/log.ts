export function log(...args: any) {
  if (process.env.LOG === 'true') {
    console.log(...args);
  }
}

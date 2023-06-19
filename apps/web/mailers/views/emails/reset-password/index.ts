import layout from '../../layouts/default';

export default function email({ url }: { url: string }): string {
  return layout(`
    <h1>Forgot your password?</h1>
    No problem! Reset your password here: <a href='${url}'>${url}</a>
  `);
}

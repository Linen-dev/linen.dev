import layout from '../../layouts/default';

export default function email({ url }: { url: string }): string {
  return layout(`
    <h1>Sign in to Linen</h1>
    <p>Click the link below to securely log in.<p>
    <p><a href='${url}'>Sign in to Linen</a></p>
  `);
}

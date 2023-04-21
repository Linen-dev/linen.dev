import layout from '../../layouts/default';

export default function email({
  communityName,
  inviterName,
  url,
}: {
  communityName: string;
  inviterName: string;
  url: string;
}): string {
  return layout(`
    <h1>Join ${communityName} on Linen</h1>
    <p>${inviterName} invited you to join ${communityName} on <a href="https://linen.dev">linen.dev</a>.</p>
    <p>Click the link below to securely sign in.<p>
    <p><a href='${url}'>Sign in to Linen</a></p>
  `);
}

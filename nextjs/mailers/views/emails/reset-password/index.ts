import layout from '../../layouts/default';

export default function email({
  host,
  token,
}: {
  host: string;
  token: string;
}): string {
  return layout(`
    <h1>Forgot your password?</h1>
    No problem! Reset your password here: <a href='${host}/reset-password?token=${token}'>${host}/reset-password?token=${token}</a>
  `);
}

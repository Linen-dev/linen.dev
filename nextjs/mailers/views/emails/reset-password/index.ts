import layout from '../../layouts/default';

export default function email({
  host,
  token,
}: {
  host: string;
  token: string;
}) {
  return layout(`
    Reset your password here: <a href='${host}/reset-password?token=${token}'>${host}/reset-password?token=${token}</a>
  `);
}

import Link from '../Link';

interface Props {
  brandColor?: string;
  fontColor: string;
  href: string;
}

export default function JoinSlack({ brandColor, fontColor, href }: Props) {
  return (
    <Link brandColor={brandColor} fontColor={fontColor} href={href}>
      Join Slack
    </Link>
  );
}

import Link from '../Link';

interface Props {
  fontColor: string;
  href: string;
}

export default function JoinDiscord({ fontColor, href }: Props) {
  return (
    <Link fontColor={fontColor} href={href}>
      Join Discord
    </Link>
  );
}

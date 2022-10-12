import Link from 'next/link';
import usePath from 'hooks/path';

interface Props {
  className?: string;
  onClick?(): void;
  href: string;
  children: React.ReactNode;
}

export default function InternalLink({
  className,
  onClick,
  href,
  children,
}: Props) {
  const path = usePath({ href });
  return (
    <Link href={path} prefetch={false}>
      <a onClick={onClick} className={className}>
        {children}
      </a>
    </Link>
  );
}

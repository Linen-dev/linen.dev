import Link from 'next/link';
import CustomLinkHelper from './CustomLinkHelper';
import { useLinkContext } from 'contexts/Link';

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
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const path = CustomLinkHelper({
    communityType,
    communityName,
    isSubDomainRouting,
    path: href,
  });
  return (
    <Link href={path} prefetch={false}>
      <a onClick={onClick} className={className}>
        {children}
      </a>
    </Link>
  );
}

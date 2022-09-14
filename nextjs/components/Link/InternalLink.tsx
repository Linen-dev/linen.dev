import Link from 'next/link';
import CustomLinkHelper from './CustomLinkHelper';
import { useLinkContext } from 'contexts/Link';

interface Props {
  className?: string;
  href: string;
  children: React.ReactNode;
}

export default function InternalLink({ className, href, children }: Props) {
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const path = CustomLinkHelper({
    communityType,
    communityName,
    isSubDomainRouting,
    path: href,
  });
  return (
    <Link href={path} prefetch={false}>
      <a className={className}>{children}</a>
    </Link>
  );
}

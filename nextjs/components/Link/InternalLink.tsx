import Link from 'next/link';
import CustomLinkHelper from './CustomLinkHelper';
import { useLinkContext } from 'contexts/Link';

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function InternalLink({ href, children }: Props) {
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const path = CustomLinkHelper({
    communityType,
    communityName,
    isSubDomainRouting,
    path: href,
  });
  return (
    <Link href={path} prefetch={false}>
      <a>{children}</a>
    </Link>
  );
}

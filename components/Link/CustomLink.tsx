import Link from 'next/link';
import CustomLinkHelper from './CustomLinkHelper';

export default function CustomLink({
  isSubDomainRouting,
  path,
  communityName,
  communityType,
  ...props
}: any) {
  return (
    <Link
      href={CustomLinkHelper({
        communityType,
        communityName,
        isSubDomainRouting,
        path,
      })}
      {...props}
    ></Link>
  );
}

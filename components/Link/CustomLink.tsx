import Link from 'next/link';
import CustomLinkHelper from './CustomLinkHelper';

export default function CustomLink({
  isSubDomainRouting,
  path,
  communityName,
  ...props
}: any) {
  return (
    <Link
      href={CustomLinkHelper({ communityName, isSubDomainRouting, path })}
      {...props}
    ></Link>
  );
}

import Link from 'next/link';
import { CustomLinkHelper } from '@linen/utilities/custom-link';

export default function CustomTableRowLink({
  isSubDomainRouting,
  path,
  communityName,
  communityType,
  ...props
}: any) {
  const href = CustomLinkHelper({
    communityType,
    communityName,
    isSubDomainRouting,
    path,
  });
  return <Link href={href} {...props} prefetch={false}></Link>;
}

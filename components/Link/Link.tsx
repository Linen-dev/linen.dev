import Link from 'next/link';

export function CustomLink({
  isSubDomainRouting,
  path,
  communityName,
  ...props
}: any) {
  if (isSubDomainRouting) {
    return <Link href={path} {...props}></Link>;
  } else {
    return <Link href={`/s/${communityName}${path}`} {...props}></Link>;
  }
}

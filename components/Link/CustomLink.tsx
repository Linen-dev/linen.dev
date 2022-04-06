import Link from 'next/link';

export default function CustomLink({
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

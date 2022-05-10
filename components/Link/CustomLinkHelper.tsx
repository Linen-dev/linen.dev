export default function CustomLinkHelper({
  isSubDomainRouting,
  path,
  communityName,
}: {
  isSubDomainRouting: boolean;
  path: string;
  communityName: string;
}) {
  if (isSubDomainRouting) {
    return path;
  } else {
    return `/s/${communityName}${path}`;
  }
}

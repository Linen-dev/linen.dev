const communityMapping: Record<string, string> = {
  discord: 'd',
  slack: 's',
};

export default function CustomLinkHelper({
  isSubDomainRouting,
  path,
  communityName,
  communityType,
}: {
  isSubDomainRouting: boolean;
  path: string;
  communityName: string;
  communityType: string;
}) {
  if (isSubDomainRouting) {
    return path;
  } else {
    return `/${communityMapping[communityType]}/${communityName}${path}`;
  }
}

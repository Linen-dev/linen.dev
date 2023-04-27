const communityMapping = {
  discord: 'd',
  slack: 's',
  linen: 's',
};

export function CustomLinkHelper({
  isSubDomainRouting,
  path,
  communityName,
  communityType,
}: {
  isSubDomainRouting: boolean;
  path: string;
  communityName: string;
  communityType: 'discord' | 'slack' | 'linen';
}) {
  if (isSubDomainRouting) {
    return path;
  } else {
    return `/${communityMapping[communityType]}/${communityName}${path}`;
  }
}

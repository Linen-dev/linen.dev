import { communityMapping } from 'serializers/account/settings';

export function CustomLinkHelper({
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

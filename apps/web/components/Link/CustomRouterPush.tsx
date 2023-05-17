import Router from 'next/router';
import { CustomLinkHelper } from '@linen/utilities/custom-link';

export default function CustomRouterPush({
  isSubDomainRouting,
  communityName,
  communityType,
}: {
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: 'discord' | 'slack' | 'linen';
}) {
  return ({ path }: { path: string }) => {
    Router.push(
      CustomLinkHelper({
        communityType,
        communityName,
        isSubDomainRouting,
        path,
      })
    );
  };
}

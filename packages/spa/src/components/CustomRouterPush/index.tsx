import { CustomLinkHelper } from '@linen/utilities/custom-link';
import type { NavigateFunction } from 'react-router-dom';

export default function CustomRouterPush({
  communityName,
  communityType,
  navigate,
}: {
  communityName: string;
  communityType: 'discord' | 'slack' | 'linen';
  navigate: NavigateFunction;
}) {
  return ({ path }: { path: string }) => {
    const url = CustomLinkHelper({
      communityType,
      communityName,
      isSubDomainRouting: false,
      path,
    });
    navigate(url);
  };
}

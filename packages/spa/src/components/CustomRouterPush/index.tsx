import { CustomLinkHelper } from '@linen/utilities/custom-link';

export default function CustomRouterPush({
  communityName,
  communityType,
}: {
  communityName: string;
  communityType: 'discord' | 'slack' | 'linen';
}) {
  return ({ path }: any) => {
    const url = CustomLinkHelper({
      communityType,
      communityName,
      isSubDomainRouting: false,
      path,
    });
    window.location.href = url;
  };
}

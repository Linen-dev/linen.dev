import { CustomLinkHelper } from '@linen/utilities/custom-link';

// this functions is used after channel is created
export default function CustomRouterPush({
  communityName,
  communityType,
}: {
  communityName: string;
  communityType: 'discord' | 'slack' | 'linen';
}) {
  return ({ path }: { path: string }) => {
    const url = CustomLinkHelper({
      communityType,
      communityName,
      isSubDomainRouting: false,
      path,
    });
    // using window to refresh the whole page and update props
    window.location.href = url;
  };
}

import CustomLinkHelper from '../../../Link/CustomLinkHelper';

export function getThreadUrl({
  isSubDomainRouting,
  communityName,
  communityType,
  slug,
  incrementId,
}: {
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
  slug: string | null;
  incrementId: number;
}) {
  const linkProps = {
    isSubDomainRouting,
    communityName,
    communityType,
    path: `/t/${incrementId}/${slug || 'topic'}`.toLowerCase(),
  };
  return `${window.location.origin}${CustomLinkHelper(linkProps)}`;
}

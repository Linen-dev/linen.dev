import { Settings } from '@linen/types';
import { LINEN_URL } from 'secrets';

export function getThreadUrl({
  isSubDomainRouting,
  slug,
  incrementId,
  settings,
  messageId,
}: {
  isSubDomainRouting: boolean;
  slug?: string | null;
  incrementId: number;
  settings: Settings;
  messageId?: string;
}) {
  const slugLowerCase = (slug || 'topic').toLowerCase();
  const prefix = settings?.prefix || 's';
  const communityName = settings?.communityName;
  const redirectDomain = settings?.redirectDomain;

  const threadLink = isSubDomainRouting
    ? `https://${redirectDomain}/t/${incrementId}/${slugLowerCase}`
    : `${LINEN_URL}/${prefix}/${communityName}/t/${incrementId}/${slugLowerCase}`;

  return `${threadLink}${!!messageId ? `#${messageId}` : ''}`;
}

import { CustomLinkHelper } from 'utilities/CustomLinkHelper';
import { useLinkContext } from '@linen/contexts/Link';

interface Props {
  href: string;
}

export default function usePath({ href }: Props): string {
  const { isSubDomainRouting, communityName, communityType } = useLinkContext();
  const path = CustomLinkHelper({
    communityType,
    communityName,
    isSubDomainRouting,
    path: href,
  });
  return path;
}

import Router from 'next/router';
import CustomLinkHelper from './CustomLinkHelper';

export default function CustomRouterPush({
  isSubDomainRouting,
  path,
  communityName,
  communityType,
}: any) {
  return Router.push(
    CustomLinkHelper({ communityType, communityName, isSubDomainRouting, path })
  );
}

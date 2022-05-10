import Router from 'next/router';
import CustomLinkHelper from './CustomLinkHelper';

export default function CustomRouterPush({
  isSubDomainRouting,
  path,
  communityName,
}: any) {
  return Router.push(
    CustomLinkHelper({ communityName, isSubDomainRouting, path })
  );
}

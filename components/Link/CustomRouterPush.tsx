import Router from 'next/router';

export default function CustomRouterPush({
  isSubDomainRouting,
  path,
  communityName,
}: any) {
  if (isSubDomainRouting) {
    return Router.push(path);
  } else {
    return Router.push(`/s/${communityName}${path}`);
  }
}

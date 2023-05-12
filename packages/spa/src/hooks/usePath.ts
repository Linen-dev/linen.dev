import { baseLinen, pathsToRedirect } from '@/config';

export default function usePath({ communityName }: { communityName: string }) {
  return ({ href }: { href: string }) => {
    if (pathsToRedirect.includes(href)) {
      return `${baseLinen}/s/${communityName}${href}`;
    }
    return href;
  };
}

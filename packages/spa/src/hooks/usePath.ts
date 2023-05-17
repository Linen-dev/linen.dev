export default function usePath({ communityName }: { communityName: string }) {
  return ({ href }: { href: string }) => {
    return `/s/${communityName}${href}`;
  };
}

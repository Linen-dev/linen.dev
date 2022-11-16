export const getCommunityName = (isProd: boolean, hostname: string | null) => {
  if (isProd) {
    return hostname?.replace(`.linen.dev`, '').replace(`*.linene.dev`, '');
  }
  return hostname?.replace(`.localhost:3000`, '') || '';
};

export default function serialize(account?: any) {
  if (!account) {
    return null;
  }
  const { homeUrl, docsUrl, redirectDomain, brandColor, id } = account;
  return { homeUrl, docsUrl, redirectDomain, brandColor, id };
}

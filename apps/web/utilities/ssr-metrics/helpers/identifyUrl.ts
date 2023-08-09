import type { GetServerSidePropsContext } from 'next/types';

export function identifyUrl({
  req,
  resolvedUrl,
}: Partial<GetServerSidePropsContext>) {
  const host = req?.headers?.host || req?.headers?.origin || '';
  const url = `${host}${resolvedUrl || req?.url}`;
  return url.replace(`/s/${host}`, '');
}

import type { GetServerSidePropsContext } from 'next/types';
import { Permissions } from '@linen/types';
import { trackPageView } from './trackPageView';

/**
 * function to track page viewed with possible redirection or notFound
 */

export async function trackPage<T>(
  context: GetServerSidePropsContext,
  data:
    | {
        redirect: {
          destination: string;
          permanent: boolean;
        };
      }
    | { notFound: true }
    | {
        props: T & {
          permissions?: Permissions;
        };
      }
) {
  if ('notFound' in data) {
    return data;
  }

  try {
    const email =
      'props' in data ? data.props.permissions?.auth?.email : undefined;

    const phId = await trackPageView(context, email);

    if ('redirect' in data && phId) {
      const dest = new URL(data.redirect.destination);
      dest.searchParams.append('phId', phId);
      data.redirect.destination = dest.toString();
    }
  } catch (error) {}

  return data;
}

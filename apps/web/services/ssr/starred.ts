import { GetServerSidePropsContext } from 'next';
import { NotFound, RedirectTo } from 'utilities/response';
import { ssr, allowInbox } from 'services/ssr/common';

export async function ssrGetServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const { props, notFound, ...rest } = await ssr(context, allowInbox);

  if (rest.redirect) {
    return RedirectTo(rest.location);
  }

  if (notFound || !props) {
    return NotFound();
  }

  return {
    props: {
      ...props,
      isSubDomainRouting,
    },
  };
}

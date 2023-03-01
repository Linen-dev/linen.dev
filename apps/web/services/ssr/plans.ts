import { GetServerSidePropsContext } from 'next';
import { NotFound, RedirectTo } from 'utilities/response';
import { ssr, allowManagers } from './common';

export async function getPlansServerSideProps(
  context: GetServerSidePropsContext,
  isSubDomainRouting: boolean
) {
  const { props, notFound, ...rest } = await ssr(context, allowManagers);

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

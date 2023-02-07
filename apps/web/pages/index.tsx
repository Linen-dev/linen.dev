import { prisma } from 'client';
import linenExamplePage from 'public/linen-example-page.png';
import Image from 'next/image';
import LinenLogo from 'components/Logo/Linen';
import YCombinatorLogo from 'components/Logo/YCombinator';
import { BsGithub } from 'react-icons/bs';
import Link from 'next/link';
import FadeIn from 'components/FadeIn';
import Head from 'next/head';
import Footer from 'components/Footer';
import type { GetServerSidePropsContext } from 'next';
import { Sections } from '@linen/ui'

const Home = ({ accounts }: Props) => {
  return (
    <>
      <Head>
        <title>Linen | Modern communication tool for communities</title>
        <meta
          name="description"
          content="Modern communication tool for communities. Designed to make chat easier."
        />
      </Head>

      <Sections.Splash
      navigation={
        [
          { label: 'Product', url: '#product' },
          { label: 'Pricing', url: '#pricing' },
          { label: 'Communities', url: '/communities' },
          { label: 'Developers', url: 'https://github.com/Linen-dev/linen.dev'},
          { label: 'Resources', url: 'https://www.linen.dev/s/linen' }
        ]
      }
      signInUrl='/signin'
      signUpUrl='/signup' 
      />
      <Sections.Timeline id="product" />
      <Sections.Pricing id="pricing" signUpUrl='/signup' contactUrl="mailto:help@linen.dev" />
      <Footer />
    </>
  );
};

type Props = {
  accounts: {
    url: string;
    name: string;
    logoUrl: string;
    brandColor: string;
  }[];
};

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  const accounts = await prisma.accounts.findMany({
    where: {
      NOT: [
        {
          logoUrl: null,
        },
      ],
      syncStatus: 'DONE',
    },
    select: {
      logoUrl: true,
      name: true,
      premium: true,
      brandColor: true,
      redirectDomain: true,
      slackDomain: true,
      discordServerId: true,
      discordDomain: true,
    },
  });

  const goodLookingLogos = accounts.filter(
    (a) =>
      !!a.name && !!a.brandColor && !!a.logoUrl && a.logoUrl.includes('.svg')
  );

  // since we use 3 columns we want it to only show numbers divisible by 3
  const remainders = goodLookingLogos
    .slice(0, goodLookingLogos.length - (goodLookingLogos.length % 3))
    .map((a) => {
      return {
        name: a.name,
        logoUrl: a.logoUrl,
        brandColor: a.brandColor,
        url:
          a.premium && a.redirectDomain
            ? 'https://' + a.redirectDomain
            : a.discordDomain
            ? 'https://linen.dev/d/' + a.discordDomain
            : 'https://linen.dev/s/' + a.slackDomain,
        // TODO:remove this once supabase sets up domain to discord.supabase.com
        ...(a.discordServerId === '839993398554656828' && {
          url: 'https://839993398554656828.linen.dev',
        }),
      };
    });

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=86400'
  );
  return {
    props: { accounts: remainders },
  };
}

export default Home;

import { prisma } from '../client';
import linenExamplePage from '../public/linen-example-page.png';
import Image from 'next/image';
import { AccountType } from '@prisma/client';
import LinenLogo from 'components/Logo/Linen';
import YCombinatorLogo from 'components/Logo/YCombinator';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';

import Link from 'next/link';
import FadeIn from '../components/FadeIn';
import Head from 'next/head';
import Footer from '../components/Footer';

interface Props {
  accounts: SerializedAccount[];
}

const Home = ({ accounts }: Props) => {
  const communities = accounts
    .filter(({ logoUrl, name }) => logoUrl?.endsWith('.svg') || name)
    .filter((account) => {
      if (account.premium) {
        return account.redirectDomain;
      }
      return account.slackDomain || account.discordDomain;
    });

  return (
    <div className="mb-10 pb-10">
      <Head>
        <title>Linen | Front page for your Slack and Discord Communities</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" passHref>
              <LinenLogo />
            </Link>
          </div>

          <div className="flex items-center justify-end md:flex-1 lg:w-0">
            <Link
              className="mr-4 whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              href="/signin"
              passHref
            >
              Sign in
            </Link>
            <div className="hidden md:block">
              <Link
                className="ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                href="/signup"
                passHref
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div className="sm:text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">
              Make Slack and Discord communities{' '}
            </span>
            <span className="block text-blue-600 xl:inline">
              Google-searchable
            </span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl ">
            Linen syncs your Slack and Discord threads to an SEO friendly
            website that allows your community to discover you through search
            engines and reduces the number of repeat questions.
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
            <div className="rounded-md shadow">
              <Link
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                href="/signup"
                passHref
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="https://osquery.fleetdm.com"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                target="_blank"
                rel="noreferrer"
              >
                Live demo
              </a>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4 flex justify-center mt-8">
            <p className="px-2">
              Backed by <b>Y Combinator</b>
            </p>
            <YCombinatorLogo />
          </div>
          <div className="flex justify-center my-20 shadow-lg">
            <FadeIn delay={200}>
              <Image
                className="rounded-md"
                alt="Linen Example Page"
                src={linenExamplePage}
              />
            </FadeIn>
          </div>
          <div className="bg-blue-700 mt-20 rounded-md">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
                  Trusted by the largest communities
                </h2>
                <p className="mt-3 text-xl text-blue-200 sm:mt-4">
                  Retain your community knowledge and improve your SEO
                </p>
              </div>
              <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-2 sm:gap-8">
                <div className="flex flex-col mt-10 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                    Messages Synced
                  </dt>
                  <dd className="order-1 text-4xl md:text-5xl font-extrabold text-white">
                    7,500,000+
                  </dd>
                </div>
                <div className="flex flex-col mt-10 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                    Members
                  </dt>
                  <dd className="order-1 text-4xl md:text-5xl font-extrabold text-white">
                    250,000+
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-10">
          <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-4xl">
            Featured Communities
          </h1>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
          {communities
            .sort((community) => (community.premium ? -1 : 1))
            .sort((community) => (community.logoUrl?.endsWith('.svg') ? -1 : 1))
            .map((community, index) => {
              let url = community.premium
                ? 'https://' + community.redirectDomain
                : community.discordDomain
                ? 'https://linen.dev/d/' + community.discordDomain
                : 'https://linen.dev/s/' + community.slackDomain;

              return (
                <CommunityCard
                  url={url}
                  name={community.name}
                  description="Community"
                  logoUrl={community.logoUrl}
                  brandColor={community.brandColor}
                  key={community.name + index}
                ></CommunityCard>
              );
            })}
        </div>

        <div className="grid grid-col-1 gap-3 mx-auto text-gray-700 prose prose-lg max-w-4xl mt-10">
          <LandingH2>
            Make your Slack/Discord threads Google searchable
          </LandingH2>
          <p>
            Linen syncs all your threads in your public channels and threads to
            linen.dev/s/your_slack_workspace_name. This makes your Slack/Discord
            contents available for your community members without requiring a
            login.
          </p>
          <LandingH2>Free to setup and use</LandingH2>
          <p>
            Linen is free to set up and install. Once you go through the 10
            minute setup process and wait for the syncing you will be able to
            make your community&apos;s threads free of charge.
          </p>
          <LandingH2>
            Generate organic content for your website and domain
          </LandingH2>
          <p>
            The paid edition puts Linen behind your subdomain where you can
            generate organic SEO friendly content that is relevant for your
            domain. You will get a 301 redirect from our subdomain to yours to
            give all the SEO benefits. You also will be able to customize your
            Linen page with your custom logo and branding.
          </p>
          <LandingH2>Scale your community and reduce support burden</LandingH2>
          <p>
            Slack/Discord communities are great for chatting and engaging but
            over time they become overwelming. As a community grows so does the
            number of repeat questions. As previously a former open source
            maintainer I wanted to minimize the number of repeat questions and
            encourage the community to search.
          </p>
          <LandingH2>A better experience for your community</LandingH2>
          <p>
            Linen is a great way to make your community content more
            discoverable. No longer do you need to login to your Slack/Discord
            workspace to view your community&apos;s content. You can link
            specific conversations in github issues without requiring a sign in
            to get the context of the issue.
          </p>
          <LandingH2>Community Privacy</LandingH2>
          <p>
            Linen only syncs conversations in the public channels. We only pull
            the display name and profile picture from Slack/Discord and we do
            not store community member&apos;s email or private information. Upon
            request we will delete any community member&apos;s information and
            messages within 14 days. Finally we have the options of anonymizing
            your community member&apos;s display name with a fake randomly
            generated string like `many-ancient-parrot`,
            `adventurous-billowy-kangaroo`, and `benedict-cumberbatch`.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface H2Props {
  children: React.ReactNode;
}

function LandingH2({ children }: H2Props) {
  return (
    <h2 className="text-1xl tracking-tight font-extrabold text-gray-800 sm:text-2xl pt-2">
      {children}
    </h2>
  );
}

const CommunityCard = ({
  url,
  brandColor,
  name,
  logoUrl,
}: {
  url: string;
  name: string;
  description: string;
  brandColor: string;
  logoUrl: string;
}) => {
  const backgroundColor = brandColor;
  const fontColor = pickTextColorBasedOnBgColor(
    backgroundColor,
    'white',
    'black'
  );
  return (
    <a
      className="flex items-center justify-center rounded py-6 px-4"
      style={{
        backgroundColor,
      }}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {logoUrl?.endsWith('.svg') ? (
        <Image src={logoUrl} alt="Logo" width="200" height="100" />
      ) : (
        <div
          className="text-4xl text-center truncate"
          style={{ color: fontColor, fontWeight: 900 }}
        >
          {name}
        </div>
      )}
    </a>
  );
};

type SerializedAccount = {
  logoUrl: string;
  name: string;
  brandColor: string;
  redirectDomain: string;
  premium: boolean;
  slackDomain: string;
  discordDomain: string;
};

export async function getStaticProps() {
  const accounts = await prisma.accounts.findMany({
    where: {
      type: AccountType.PUBLIC,
      syncStatus: 'DONE',
      NOT: { brandColor: null },
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

  return {
    props: { accounts },
  };
}

export default Home;

import { prisma } from '../client';
import linenExamplePage from '../public/linen-example-page.png';
import ycLogo from '../public/yc-logo.png';
import Image from 'next/image';

import { Popover } from '@headlessui/react';
import Link from 'next/link';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FadeIn from '../components/FadeIn';
import Head from 'next/head';
import Footer from '../components/Footer';

const Home = (props: { accounts: Props[] }) => {
  const accounts = props.accounts;
  return (
    <div className="mb-10 pb-10">
      <Head>
        <title>Linen | Front page for your Slack and Discord Communities</title>
      </Head>

      <Popover className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href={'/'} passHref>
                <img
                  className="h-8 w-auto sm:h-10 cursor-pointer"
                  src="https://linen-assets.s3.amazonaws.com/linen-black-logo.svg"
                  alt="Linen logo"
                />
              </Link>
            </div>
            <div className="-mr-2 -my-2 md:hidden">
              <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open menu</span>
                <FontAwesomeIcon
                  icon={faBars}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </Popover.Button>
            </div>

            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link href={'/signin'} passHref>
                <a
                  href="#"
                  className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                >
                  Sign in
                </a>
              </Link>
              <Link href={'https://linen.dev/signup'} passHref>
                <a
                  href="#"
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </a>
              </Link>
            </div>
          </div>
        </div>
      </Popover>

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
              <a
                href="https://linen.dev/signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </a>
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
            <Image src={ycLogo} width="25" height="25" />
          </div>
          <div className="flex justify-center my-20 shadow-lg">
            <FadeIn delay={200}>
              <Image className="rounded-md" src={linenExamplePage} />
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
          {accounts.map((a, index) => {
            let url = a.premium
              ? 'https://' + a.redirectDomain
              : a.discordDomain
              ? 'https://linen.dev/d/' + a.discordDomain
              : 'https://linen.dev/s/' + a.slackDomain;

            // TODO:remove this once supabase sets up domain to discord.supabase.com
            if (url.includes('supabase')) {
              url = 'https://839993398554656828.linen.dev/';
            }
            return (
              <CommunityCard
                url={url}
                communityName={a.name}
                description="Community"
                logoUrl={a.logoUrl}
                brandColor={a.brandColor}
                key={a.name + index}
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
            workspace to view your community's content. You can link specific
            conversations in github issues without requiring a sign in to get
            the context of the issue.
          </p>
          <LandingH2>Community Privacy</LandingH2>
          <p>
            Linen only syncs conversations in the public channels. We only pull
            the display name and profile picture from Slack/Discord and we do
            not store community member's email or private information. Upon
            request we will delete any community member's information and
            messages within 14 days. Finally we have the options of anonymizing
            your community member's display name with a fake randomly generated
            string like `many-ancient-parrot`, `adventurous-billowy-kangaroo`,
            and `benedict-cumberbatch`.
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
    <h2 className="text-1xl tracking-tight font-extrabold text-gray-800 sm:text-5xl md:text-2xl pt-2">
      {children}
    </h2>
  );
}

const CommunityCard = ({
  url,
  brandColor,
  logoUrl,
}: {
  url: string;
  communityName: string;
  description: string;
  brandColor: string;
  logoUrl: string;
}) => {
  return (
    <a
      className="flex items-center justify-center rounded"
      style={{
        backgroundColor: brandColor,
      }}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <Image src={logoUrl} width="200px" height="100%"></Image>
    </a>
  );
};

type Props = {
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

  const goodLookingLogos = accounts.filter((a) => a.logoUrl?.includes('.svg'));
  // since we use 3 columns we want it to only show numbers divisible by 3
  const remainders = goodLookingLogos.slice(
    0,
    goodLookingLogos.length - (goodLookingLogos.length % 3)
  );

  return {
    props: { accounts: remainders },
  };
}

export default Home;

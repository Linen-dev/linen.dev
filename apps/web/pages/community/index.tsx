import linenExamplePage from 'public/linen-example-page.png';
import Image from 'next/image';
import LinenLogo from '@linen/ui/LinenLogo';
import YCombinatorLogo from '@linen/ui/YCombinatorLogo';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { AiFillGithub } from '@react-icons/all-files/ai/AiFillGithub';
import Link from 'next/link';
import FadeIn from '@linen/ui/FadeIn';
import Head from 'next/head';
import Footer from 'components/Footer';
import type { GetServerSidePropsContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';
import { communitiesWithLogo } from 'services/accounts';

const Home = (props: { accounts: Props[] }) => {
  const accounts = props.accounts;
  const tiers = [
    {
      name: 'Community Edition',
      href: '/signup',
      priceMonthly: 'Free',
      description: 'Free for open source and non profit communities',
      features: [
        'Unlimited history retention',
        'Hosted under Linen.dev',
        'Community support',
        'Import Slack and Discord conversations',
      ],
    },
    {
      name: 'Business Edition',
      href: 'mailto:help@linen.dev',
      priceMonthly: 'Contact us',
      description: 'Improve your SEO and generate organic traffic',
      features: [
        'Host Linen under your custom url/subdomain',
        'Custom community branding',
        'SEO benefits',
        'Priority Support',
      ],
    },
  ];
  const features = [
    {
      name: 'Custom branding',
      description:
        'Get branded colors and logos of your community or company. Your community should feel like yours and not',
      // icon: GlobeAltIcon,
    },
    {
      name: 'Host Linen on your own domain',
      description:
        'Get organic SEO traffic from Google. Linen generates a set of long tail keywords. Our largest community has seen over 180,0000 Google impressions',
      // icon: ScaleIcon,
    },
    {
      name: 'Analytics tracking',
      description: 'Add your own analytics tracking to your community ',
      // icon: BoltIcon,
    },
  ];
  return (
    <div className="mb-10 pb-10">
      <Head>
        <title>Linen | Slack alternative designed for communities</title>
      </Head>

      <div className="max-w-rxl mx-auto px-2 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-2 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link legacyBehavior href="/" passHref>
              <a>
                <LinenLogo />
              </a>
            </Link>
          </div>
          <a
            className="hidden sm:flex flex-row items-center mr-4 whitespace-nowrap text-base font-medium text-gray-600 hover:text-gray-900"
            href="https://github.com/linen-dev/linen.dev"
            target="_blank"
            rel="noreferrer"
          >
            <div className="pr-2">
              <AiFillGithub />
            </div>
            Star us on Github
          </a>
          <div className="flex items-center justify-end md:flex-1 lg:w-0">
            <Link legacyBehavior href="/signin" passHref>
              <a className="mr-4 whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900 ">
                Sign in
              </a>
            </Link>
            <div className="hidden md:block">
              <Link legacyBehavior href="/signup" passHref>
                <a className="ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Get Started
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div className="sm:text-center">
          <h1 className="flex flex-col text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            <div className="block xl:inline">
              Google-Searchable and community focused{' '}
            </div>
            <div className="block text-blue-600 xl:inline">
              Slack alternative{' '}
            </div>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl ">
            Sync your Slack and Discord conversations to Linen and get SEO
            benefits while reducing customer support load
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
            <div className="rounded-md shadow">
              <Link legacyBehavior href="/signup" passHref>
                <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Get Started
                </a>
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="https://linen.dev/s/linen"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                target="_blank"
                rel="noreferrer"
              >
                Linen community
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
              <Image className="rounded-md" src={linenExamplePage} alt={'YC'} />
            </FadeIn>
          </div>
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
                  Pages indexed by Google
                </dt>
                <dd className="order-1 text-4xl md:text-5xl font-extrabold text-white">
                  50,000+
                </dd>
              </div>
              <div className="flex flex-col mt-10 sm:mt-0">
                <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                  Number of search impresssions
                </dt>
                <dd className="order-1 text-4xl md:text-5xl font-extrabold text-white">
                  200,000+
                </dd>
              </div>
            </dl>
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

        <div className="relative overflow-hidden pt-16 pb-32">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-100"
          />
          <div className="relative">
            <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
              <div className="mx-auto max-w-xl px-4 sm:px-6 lg:mx-0 lg:max-w-none lg:py-16 lg:px-0">
                <div>
                  {/* <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  </div> */}
                  <div className="mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                      Built for community support
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                      It is easy to miss conversations in traditional chat apps.
                      In Linen you can manage all of your conversations from
                      multiple channels in a single Inbox view. With open/close
                      states you can view all the conversations that need your
                      attention in a single page
                    </p>
                    <div className="mt-6">
                      <Link legacyBehavior href="/signup">
                        <a className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700">
                          Get started
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 sm:mt-16 lg:mt-0">
                <div className="-mr-48 pl-4 sm:pl-6 md:-mr-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                  <img
                    className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                    src="https://static.main.linendev.com/feedExample.png"
                    alt="Inbox user interface"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24">
            <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-2 lg:gap-24 lg:px-8">
              <div className="mx-auto max-w-xl px-4 sm:px-6 lg:col-start-2 lg:mx-0 lg:max-w-none lg:py-32 lg:px-0">
                <div>
                  {/* <div>
                    <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600"></span>
                  </div> */}
                  <div className="mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                      Let Google answers questions and not your team
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                      Linen is designed to be search-engine friendly. Most if
                      not all chat tools are not search-engine friendly or
                      accessible. Linen is search-engine friendly because we
                      render a static version of our app to search engines like
                      Google{' '}
                    </p>
                    <div className="mt-6">
                      <Link legacyBehavior href="/signup">
                        <a className="inline-flex rounded-md border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-origin-border px-4 py-2 text-base font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700">
                          Get started
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 sm:mt-16 lg:col-start-1 lg:mt-0">
                <div className="-ml-48 pr-4 sm:pr-6 md:-ml-16 lg:relative lg:m-0 lg:h-full lg:px-0">
                  <img
                    className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                    src="https://static.main.linendev.com/search.svg"
                    alt="Customer profile user interface"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-10">
          <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-4xl">
            Premium features
          </h1>
        </div>

        <div className="bg-white py-12">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <dl className="space-y-10 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
              {features.map((feature) => (
                <div key={feature.name}>
                  <dt>
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                      <GoCheck className="h-6 w-6" aria-hidden="true" />
                      {/* <feature.icon className="h-6 w-6" aria-hidden="true" /> */}
                    </div>
                    <p className="mt-5 text-lg font-medium leading-6 text-gray-900">
                      {feature.name}
                    </p>
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="bg-gray-900">
          <div className="pt-12 sm:pt-16 lg:pt-24">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl space-y-2 lg:max-w-none">
                <h2 className="text-xl font-semibold leading-6 text-gray-300">
                  Pricing
                </h2>
                <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Free and unlimited messages for communities
                </p>
                <p className="text-xl text-gray-300">
                  Don&apos;t lose your data after 90 days.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-gray-50 pb-12 sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
            <div className="relative">
              <div className="absolute inset-0 h-3/4 bg-gray-900" />
              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-md space-y-4 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:gap-5 lg:space-y-0">
                  {tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className="flex flex-col overflow-hidden rounded-lg shadow-lg"
                    >
                      <div className="bg-white px-6 py-8 sm:p-10 sm:pb-6">
                        <div>
                          <h3
                            className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-base font-semibold text-indigo-600"
                            id="tier-business"
                          >
                            {tier.name}
                          </h3>
                        </div>
                        <div className="mt-4 flex items-baseline text-6xl font-bold tracking-tight">
                          {tier.priceMonthly}
                        </div>
                        <p className="mt-5 text-lg text-gray-500">
                          {tier.description}
                        </p>
                      </div>
                      <div className="flex flex-1 flex-col justify-between space-y-6 bg-gray-50 px-6 pt-6 pb-8 sm:p-10 sm:pt-6">
                        <ul role="list" className="space-y-4">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                              <div className="flex-shrink-0">
                                <GoCheck className="text-green-500" />
                              </div>
                              <p className="ml-3 text-base text-gray-700">
                                {feature}
                              </p>
                            </li>
                          ))}
                        </ul>
                        <div className="rounded-md shadow">
                          <a
                            href={tier.href}
                            className="flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-5 py-3 text-base font-medium text-white hover:bg-gray-900"
                            aria-describedby="tier-business"
                          >
                            Get started
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-col-1 gap-3 mx-auto text-gray-700 prose prose-lg max-w-4xl mt-10">
          <LandingH2>
            Same familiar chat experience with benefits of a forum
          </LandingH2>
          <p>
            Linen is a real time chat app that is designed to have all the
            benefits of a forum while having the user experience of a chat app.
            Your community doesn&apos;t have to learn a new user experience
          </p>
          <LandingH2>Linen communities are Google searchable</LandingH2>
          <p>
            Linen is a realtime chat app that also is Google searchable. syncs
            all your threads in your public channels and threads to
            linen.dev/s/community_name. This makes your content available for
            your community members without requiring a login.
          </p>
          <LandingH2>Import your community conversations</LandingH2>
          <p>
            You can import your community Linen is free to set up and install.
            Once you go through the 10 minute setup process and wait for the
            syncing you will be able to make your community&apos;s threads free
            of charge.
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
      className="flex items-center justify-center rounded py-8"
      style={{
        backgroundColor: brandColor,
      }}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      <Image src={logoUrl} alt="Logo" height="100" width="200"></Image>
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

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const track = trackPageView({ req, res });
  const accounts = await communitiesWithLogo();

  const goodLookingLogos = accounts.filter((a) => a.logoUrl?.includes('.svg'));
  // since we use 3 columns we want it to only show numbers divisible by 3
  const remainders = goodLookingLogos.slice(
    0,
    goodLookingLogos.length - (goodLookingLogos.length % 3)
  );
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=86400'
  );
  await track.flush();
  return {
    props: { accounts: remainders },
  };
}

export default Home;

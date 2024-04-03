import linenExamplePage from '../public/kotlin.png';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '../components/Footer';
import LinenLogo from '@linen/ui/LinenLogo';
import { prisma } from '@linen/database';
import { AiFillGithub } from '@react-icons/all-files/ai/AiFillGithub';
import classNames from 'classnames';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';

export const config = {
  unstable_runtimeJS: false,
};

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '#',
    priceMonthly: '$150',
    description:
      'Up to 5,000 members. Perfect for small communities or personal projects.',
    features: [
      'Up to 5,000 members',
      'Google Indexable',
      'Unlimited history retention',
      'Branded community',
      'Community Support',
      'Custom domain',
      'Sitemap generation',
      'Import Slack and Discord conversations',
    ],
    mostPopular: false,
  },
  {
    name: 'Business',
    id: 'tier-business',
    href: '#',
    priceMonthly: '$250',
    description: 'Up to 20,000 members. Perfect for growing communities.',
    features: [
      'Up to 20,000 members',
      'Google Indexable',
      'Unlimited history retention',
      'Branded community',
      'Priority Support',
      'Custom domain',
      'Sitemap generation',
      'Import Slack and Discord conversations',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: '$400',
    description: 'Unlimited members. Perfect for large communities.',
    features: [
      'Unlimited members',
      'Google Indexable',
      'Unlimited history retention',
      'Branded community',
      '24-hour support response time',
      'Custom domain',
      'Sitemap generation',
      'Import Slack and Discord conversations',
      'Optional: Your company featured on the Linen.dev website and GitHub readme',
    ],
    mostPopular: false,
  },
];

const Home = (props: { accounts: Props[] }) => {
  const accounts = props.accounts;
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
          <a
            className="hidden sm:flex flex-row items-center mr-4 whitespace-nowrap text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
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
            <Link
              className="whitespace-nowrap text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              href="/signin"
              passHref
            >
              Sign in
            </Link>
            <div className="hidden md:block ml-8">
              <Link
                className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
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
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">
              Make Slack and Discord communities{' '}
            </span>
            <span className="block text-blue-600 xl:inline">
              Google-searchable
            </span>
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl ">
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
                href="https://slack-chats.kotlinlang.org"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                target="_blank"
                rel="noreferrer"
              >
                Live demo
              </a>
            </div>
          </div>
          <div className="flex justify-center my-20 shadow-lg">
            <Image
              className="rounded-md"
              alt="Linen Example Page"
              src={linenExamplePage}
            />
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

        <div className="py-24">
          <div className="flex flex-col items-center mt-10">
            <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl md:text-4xl">
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
        </div>

        <div className="grid grid-col-1 gap-3 mx-auto text-gray-700 dark:text-gray-300 prose prose-lg max-w-4xl mt-10 py-24">
          {[
            {
              title: 'Features',
              description: 'Make your Slack/Discord threads Google searchable',
              body: 'Linen syncs all your threads in your public channels and threads to linen.dev/s/your_slack_workspace_name. This makes your Slack/Discord contents available for your community members without requiring a login.',
            },
            {
              description:
                'Generate organic content for your website and domain',
              body: 'The paid edition puts Linen behind your subdomain where you can generate organic SEO friendly content that is relevant for your domain. You will get a 301 redirect from our subdomain to yours to give all the SEO benefits. You also will be able to customize your Linen page with your custom logo and branding.',
            },
            {
              description: 'Scale your community and reduce support burden',
              body: 'Slack/Discord communities are great for chatting and engaging but over time they become overwhelming. As a community grows so does the number of repeat questions. As previously a former open source maintainer I wanted to minimize the number of repeat questions and encourage the community to search.',
            },
            {
              description: 'A better experience for your community',
              body: "Linen is a great way to make your community content more discoverable. No longer do you need to login to your Slack/Discord workspace to view your community's content. You can link specific conversations in github issues without requiring a sign in to get the context of the issue.",
            },
            {
              description: 'Community Privacy',
              body: "Linen only syncs conversations in the public channels. We only pull the display name and profile picture from Slack/Discord and we do not store community member's email or private information. Upon request we will delete any community member's information and messages within 14 days. Finally we have the options of anonymizing your community member's display name with a fake randomly generated string like `many-ancient-parrot`, `adventurous-billowy-kangaroo`, and `benedict-cumberbatch`.",
            },
          ].map((_, index) => (
            <div className="mx-auto max-w-4xl text-center" key={index}>
              {!!_.title && (
                <h2 className="text-base font-semibold leading-7 text-blue-600">
                  {_.title}
                </h2>
              )}
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 ">
                {_.description}
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
                {_.body}
              </p>
            </div>
          ))}
        </div>

        <div className="relative isolate px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                Pricing
              </h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
                Upgrade for branded community
              </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
              Hosting your own branded community on your website can boost your
              online presence through SEO and ease the load on your support team
              by encouraging members to find answers on Google.{' '}
            </p>
            <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {tiers.map((tier, tierIdx) => (
                <div
                  key={tier.id}
                  className={classNames(
                    tier.mostPopular ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                    tierIdx === 0 ? 'lg:rounded-r-none' : '',
                    tierIdx === tiers.length - 1 ? 'lg:rounded-l-none' : '',
                    'flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-x-4">
                      <h3
                        id={tier.id}
                        className={classNames(
                          tier.mostPopular ? 'text-blue-600' : 'text-gray-900',
                          'text-lg font-semibold leading-8'
                        )}
                      >
                        {tier.name}
                      </h3>
                      {tier.mostPopular ? (
                        <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                          Most popular
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-4xl font-bold tracking-tight text-gray-900">
                        {tier.priceMonthly}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-gray-600">
                        /month
                      </span>
                    </p>
                    <p className="text-sm leading-6 text-gray-600 italic ">
                      2 months off when billed yearly
                    </p>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      {tier.description}
                    </p>
                    <ul
                      role="list"
                      className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                    >
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <GoCheck
                            className="h-6 w-5 flex-none text-blue-600"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={tier.href}
                    aria-describedby={tier.id}
                    className={classNames(
                      tier.mostPopular
                        ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
                        : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300',
                      'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    )}
                  >
                    Get Started today
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

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
      <div className="relative py-8 w-full">
        <Image
          src={logoUrl}
          alt="Logo"
          fill
          style={{ maxWidth: 200, margin: 'auto' }}
        ></Image>
      </div>
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
          redirectDomain: null,
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

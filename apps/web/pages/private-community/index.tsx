import linenExamplePage from 'public/linen-example-page-may-3-2023.png';
import settingsExamplePage from 'public/settings-page-may-4.png';
import Image from 'next/image';
import LinenLogo from '@linen/ui/LinenLogo';
import YCombinatorLogo from '@linen/ui/YCombinatorLogo';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { AiFillGithub } from '@react-icons/all-files/ai/AiFillGithub';
import { GiFeather } from '@react-icons/all-files/gi/GiFeather';
import { CgInfinity } from '@react-icons/all-files/cg/CgInfinity';
import { RiPlantLine } from '@react-icons/all-files/ri/RiPlantLine';
import { AiOutlineSync } from '@react-icons/all-files/ai/AiOutlineSync';
import { FaMask } from '@react-icons/all-files/fa/FaMask';
import { BiImport } from '@react-icons/all-files/bi/BiImport';
import Link from 'next/link';
import FadeIn from '@linen/ui/FadeIn';
import Head from 'next/head';
import Footer from 'components/Footer';
import type { GetServerSidePropsContext } from 'next';
import { communitiesWithLogo } from 'services/accounts';
import { serializeAccount } from '@linen/serializers/account';
import { getHomeUrl } from '@linen/utilities/home';
import { SerializedAccount } from '@linen/types';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

const Home = ({ accounts }: Props) => {
  const tiers = [
    {
      name: 'Community',
      id: 'tier-community',
      href: '#',
      priceMonthly: 'Free',
      description:
        "The perfect plan for non profits and hobbyists who don't need a custom domain and branding",
      features: [
        'Private communities',
        'Unlimited history retention',
        'Hosted under Linen.dev',
        'Community support',
        'Import Slack and Discord conversations',
      ],
      featured: false,
    },
    {
      name: 'Enterprise',
      id: 'tier-business',
      href: '#',
      priceMonthly: 'Contact Us',
      description:
        'Own your data and brand. We will host your community for you.',
      features: [
        'Whitelabeled',
        'Custom domain',
        'Priority Support',
        'CRM integrations',
        'Single sign on (SSO)',
        'Customer Support integrations',
      ],
      featured: true,
    },
  ];
  const features = [
    {
      name: 'Branded',
      description:
        'Linen is whitelabeled. This means that your community will have your logo, colors, and domain name.',
      href: '#',
      icon: GiFeather,
    },
    {
      name: 'Support + CRM integrations',
      description:
        'Linen integrates with your existing support and CRM tools. This means that you can identify leads and evangelists in your community.',
      href: '#',
      icon: CgInfinity,
    },
    {
      name: 'Single sign on (SSO)',
      description:
        'Linen integrates with your existing SSO provider. This means that your users can sign in with their existing credentials.',
      href: 'https://www.google.com/search?q=site%3Alinen.dev',
      icon: RiPlantLine,
    },
  ];

  const existingCommunityFeatures = [
    {
      name: 'Two way real-time sync',
      description:
        'You can sync all of your existing conversations from Slack and Discord. This means that any messages that gets sent in Linen will show up in Slack or Discord and vice versa in realtime.',
      href: '#',
      icon: AiOutlineSync,
    },
    {
      name: 'Import all your members',
      description:
        'Linen can import your members with a click of a button. We will send an invite to all of your members to join your community.',
      href: '#',
      icon: FaMask,
    },
    {
      name: 'Import entire history',
      description:
        'You can import your entire community history. Linen will save and publically archive your conversations beyond 90 days. We even can access your Slack history beyond 90 days without upgrading Slack',
      href: 'https://www.google.com/search?q=site%3Alinen.dev',
      icon: BiImport,
    },
  ];

  return (
    <div className="mb-10 pb-10">
      <Head>
        <title>Linen | Slack alternative designed for communities</title>
        <meta
          name="description"
          content="White-labeled Private Chat communities. Sync your Slack and Discord conversations to Linen and get SEO benefits while reducing customer support load."
        />
      </Head>

      <div className="max-w-rxl mx-auto px-2 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 dark:border-gray-700 py-2 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link legacyBehavior href="/" passHref>
              <a>
                <LinenLogo />
              </a>
            </Link>
          </div>
          {/* <a
            className="hidden sm:flex flex-row items-center mr-4 whitespace-nowrap text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            href="https://github.com/linen-dev/linen.dev"
            target="_blank"
            rel="noreferrer"
          >
            <div className="pr-2">
              <AiFillGithub />
            </div>
            Star us on Github
          </a> */}
          <div className="flex items-center justify-end md:flex-1 lg:w-0">
            <Link legacyBehavior href="/signin" passHref>
              <a className="mr-4 whitespace-nowrap text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Sign in
              </a>
            </Link>
            <div className="hidden md:block">
              <Link legacyBehavior href="/signup" passHref>
                <a className="ml-4 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Contact Us
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div className="sm:text-center">
          <h1 className="flex flex-col text-3xl tracking-tight font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl">
            <div className="space-x-2 content-center">
              <span>White-labeled Private</span>
              <span className="text-blue-600 xl:inline">Slack alternative</span>
            </div>
            <div className="block">for Communities</div>
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl ">
            Modern communities are built on real-time chat platforms and not
            forums. Linen gives you a branded space that you can control.{' '}
          </p>
          <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
            <div className="rounded-md shadow">
              <Link
                legacyBehavior
                href="mailto:help@linen.dev?subject=Private Linen communities"
                passHref
              >
                <a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Contact Us
                </a>
              </Link>
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
                src={linenExamplePage}
                alt={'example-community'}
              />
            </FadeIn>
          </div>
        </div>

        <div className="sm:py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                Private and Branded
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                It is your space not Slack/Discord&apos;s
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 ">
                Linen is a chat first community platform. Modern communities are
                built on real-time chat platforms and not forums. Linen is built
                for communities with a focus on privacy and branding. Linen
                gives you a branded community space that you own.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                      <feature.icon
                        className="h-5 w-5 flex-none text-blue-600"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                      <p className="flex-auto">{feature.description}</p>
                      {/* <p className="mt-6">
                        <a
                          href={feature.href}
                          className="text-sm font-semibold leading-6 text-blue-600"
                        >
                          Learn more <span aria-hidden="true">→</span>
                        </a>
                      </p> */}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-8 lg:pt-4">
                <div className="lg:max-w-lg">
                  <h2 className="text-base font-semibold leading-7 text-blue-600">
                    Existing communities
                  </h2>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
                    Already have a community?
                  </p>
                  <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 ">
                    Linen suports two way sync between Slack and Discord so you
                    can gradually transition your community to Linen.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 dark:text-gray-300 lg:max-w-none">
                    {existingCommunityFeatures.map((feature) => (
                      <div key={feature.name} className="relative pl-9">
                        <dt className="inline font-semibold text-gray-900 dark:text-gray-100">
                          <feature.icon
                            className="absolute left-1 top-1 h-5 w-5 text-blue-600"
                            aria-hidden="true"
                          />
                          {feature.name}
                        </dt>{' '}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <Image
                width={2432}
                height={1442}
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                src={settingsExamplePage}
                alt={'example-settings-page'}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mt-10">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Browse
          </h2>
          <h1 className="text-2xl tracking-tight font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl md:text-4xl">
            Find Communities
          </h1>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
            {accounts.map((a, index) => {
              return (
                <CommunityCard
                  community={a}
                  key={(a.name as string) + index}
                ></CommunityCard>
              );
            })}
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-3 py-8 w-full flex items-center justify-center">
            <button>
              <a
                href="https://linen.dev/communities"
                className="flex items-center justify-center border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                target="_blank"
                rel="noreferrer"
              >
                Browse Community
              </a>
            </button>
          </div>
        </div>

        <div className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
          <div
            className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
            aria-hidden="true"
          >
            <div
              className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
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
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.featured
                    ? 'relative bg-gray-900 dark:bg-black shadow-2xl'
                    : 'bg-white sm:mx-8 lg:mx-0',
                  tier.featured
                    ? ''
                    : tierIdx === 0
                    ? 'bg-white rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl'
                    : 'sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none',
                  'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10'
                )}
              >
                <h3
                  id={tier.id}
                  className={classNames(
                    tier.featured ? 'text-blue-400' : 'text-blue-600',
                    'text-base font-semibold leading-7'
                  )}
                >
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span
                    className={classNames(
                      tier.featured ? 'text-white' : 'text-gray-900',
                      'text-5xl font-bold tracking-tight'
                    )}
                  >
                    {tier.priceMonthly}
                  </span>
                  <span
                    className={classNames(
                      tier.featured ? 'text-gray-400' : 'text-gray-500',
                      'text-base'
                    )}
                  >
                    {/* /month */}
                  </span>
                </p>
                <p
                  className={classNames(
                    tier.featured ? 'text-gray-300' : 'text-gray-600',
                    'mt-6 text-base leading-7'
                  )}
                >
                  {tier.description}
                </p>
                <ul
                  role="list"
                  className={classNames(
                    tier.featured ? 'text-gray-300' : 'text-gray-600',
                    'mt-8 space-y-3 text-sm leading-6 sm:mt-10'
                  )}
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <GoCheck
                        className={classNames(
                          tier.featured ? 'text-blue-400' : 'text-blue-600',
                          'h-6 w-5 flex-none'
                        )}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={
                    'mailto:help@linen.dev?subject=Private Linen communities'
                  }
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.featured
                      ? 'bg-blue-500 text-white shadow-sm hover:bg-blue-400 focus-visible:outline-blue-500'
                      : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline-blue-600',
                    'mt-8 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10'
                  )}
                >
                  Contact Us
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const CommunityCard = ({ community }: { community: SerializedAccount }) => {
  return (
    <a
      className="flex items-center justify-center rounded py-8"
      style={{
        backgroundColor: community.brandColor,
      }}
      href={getHomeUrl(community)}
      target="_blank"
      rel="noreferrer"
    >
      <Image
        src={community.logoUrl as string}
        alt="Logo"
        height="100"
        width="200"
      ></Image>
    </a>
  );
};

type Props = {
  accounts: SerializedAccount[];
};

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  const accounts = await communitiesWithLogo();

  // since we use 3 columns we want it to only show numbers divisible by 3
  const remainders = accounts
    .slice(0, accounts.length - (accounts.length % 3))
    .map(serializeAccount);

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=43200, stale-while-revalidate=86400'
  );
  return {
    props: { accounts: remainders },
  };
}

export default Home;

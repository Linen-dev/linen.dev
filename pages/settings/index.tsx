import React, { useEffect, useState } from 'react';
import { NextPageContext } from 'next';
import { useS3Upload } from 'next-s3-upload';
import { getSession } from 'next-auth/react';
import DashboardLayout from 'components/layout/DashboardLayout';
import TextField from 'components/TextField';
import ColorField from 'components/ColorField';
import Button from 'components/Button';
import serializeAccount, { SerializedAccount } from '../../serializers/account';
import { stripProtocol } from '../../utilities/url';
import BlankLayout from 'components/layout/BlankLayout';
import {
  faCirclePause,
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { toast } from 'components/Toast';
import { findAccountByEmail } from '../../lib/models';
import { capitalize } from 'lib/util';
import BotButton from 'components/BotButton';
import Label from 'components/Label';
import CheckboxField from '@/components/CheckboxField';
import classNames from 'classnames';
import Onboarding from 'components/Pages/Settings/Onboarding';

interface Props {
  account?: SerializedAccount;
}

function Card({
  children,
  readOnly = false,
  className = '',
}: {
  children: React.ReactNode;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'p-3 mb-3 rounded border-gray-200 border-solid border',
        readOnly ? 'bg-slate-50' : '',
        className
      )}
    >
      {children}
    </div>
  );
}

function PremiumCard({
  children,
  isPremium = false,
  className = '',
}: {
  children: React.ReactNode;
  isPremium?: boolean;
  className?: string;
}) {
  return (
    <Card readOnly={!isPremium} className={className}>
      {children}
    </Card>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return <div className="text-sm mb-2 text-gray-600">{children}</div>;
}

export default function SettingsPage({ account }: Props) {
  const router = useRouter();

  useEffect(() => {
    const error = router.query.error as string;
    if (error) {
      toast.error('Something went wrong, please try again');
      router.replace('/settings', undefined, { shallow: true });
    }
  }, [router.query.error]);

  useEffect(() => {
    const success = router.query.success as string;
    if (success) {
      toast.success(decodeURI(success));
      router.replace('/settings', undefined, { shallow: true });
    }
  }, [router.query.success]);

  let [logoUrl, setLogoUrl] = useState(String);
  let { FileInput, openFileDialog, uploadToS3, files } = useS3Upload();

  if (account) {
    let handleLogoChange = async (file: File) => {
      let { url } = await uploadToS3(file, {
        endpoint: {
          request: {
            body: {
              asset: 'logos',
              accountId: account.id,
            },
            headers: {},
          },
        },
      });
      setLogoUrl(url);
    };

    const onSubmit = (event: any) => {
      event.preventDefault();
      const form = event.target;
      const homeUrl = form.homeUrl.value;
      const docsUrl = form.docsUrl.value;
      const redirectDomain = stripProtocol(form.redirectDomain.value);
      const googleAnalyticsId = form.googleAnalyticsId?.value;
      const brandColor = form.brandColor.value;
      const anonymizeUsers = form.anonymizeUsers.checked;
      fetch('/api/accounts', {
        method: 'PUT',
        body: JSON.stringify({
          accountId: account.id,
          homeUrl,
          docsUrl,
          logoUrl,
          redirectDomain,
          brandColor,
          googleAnalyticsId,
          anonymizeUsers,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          toast.success('Saved successfully!');
        });
    };
    const iconClassName = 'h-5 w-5 mr-2';

    const slackSyncComponent = (
      <div className="py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 pb-4">
          {capitalize(account.communityType)} Synchronization
        </h1>
        <div className="flex">
          {account.slackSyncStatus === 'NOT_STARTED' && (
            <>
              <FontAwesomeIcon icon={faCirclePause} className={iconClassName} />{' '}
              Not started
            </>
          )}
          {account.slackSyncStatus === 'IN_PROGRESS' && (
            <>
              <FontAwesomeIcon icon={faSpinner} className={iconClassName} /> In
              progress
            </>
          )}
          {account.slackSyncStatus === 'DONE' && (
            <>
              <FontAwesomeIcon
                icon={faCircleCheck}
                color="green"
                className={iconClassName}
              />
              Done
            </>
          )}
          {account.slackSyncStatus === 'ERROR' && (
            <>
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className={iconClassName}
                color="red"
              />{' '}
              Error
            </>
          )}
        </div>
        <div className="flex flex-row">
          <div className="flex-initial">
            <BotButton communityType={account.communityType} />
          </div>
        </div>
      </div>
    );

    const freeAccountSettings = (
      <>
        <h3 className="font-bold font-xl mb-3">Free</h3>
        <Card>
          <Label htmlFor="homeUrl">Home URL</Label>
          <Description>Link to your home page.</Description>
          <TextField
            placeholder="https://yourwebsite.com"
            id="homeUrl"
            defaultValue={account.homeUrl}
            required
          />
        </Card>
        <Card>
          <Label htmlFor="docsUrl">Docs URL</Label>
          <Description>Link to your documentation.</Description>
          <TextField
            placeholder="https://docs.yourwebsite.com"
            id="docsUrl"
            defaultValue={account.docsUrl}
            required
          />
        </Card>
        <Card>
          <Label htmlFor="redirectDomain">Redirect Domain</Label>
          <Description>Unique domain to redirect to.</Description>
          <TextField
            placeholder="linen.yourwebsite.com"
            id="redirectDomain"
            defaultValue={account.redirectDomain}
            required
          />
        </Card>
        <Card>
          <Label htmlFor="anonymizeUsers">Anonymize Users</Label>
          <Description>Replace real usernames by randomly alias.</Description>
          <CheckboxField id="anonymizeUsers" checked={account.anonymizeUsers} />
        </Card>
      </>
    );

    const premiumAccountSettings = (
      <>
        <h3 className="font-bold font-xl mb-3">Premium</h3>
        <PremiumCard isPremium={account.premium} className="h-full">
          <Label htmlFor="brandColor">Brand Color</Label>
          <Description>
            Color that matches your brand. We&apos;ll use it for the header
            background.
          </Description>
          <ColorField
            id="brandColor"
            defaultValue={account.premium ? account.brandColor : '#E2E2E2'}
            required
            readOnly={!account.premium}
            disabled={!account.premium}
          />
        </PremiumCard>
        <PremiumCard isPremium={account.premium} className="h-full">
          <Label htmlFor="logo">Logo</Label>
          <Description>Logo of your brand.</Description>
          <FileInput onChange={handleLogoChange} />
          {logoUrl ? (
            <img
              alt=""
              src={logoUrl}
              style={{
                backgroundColor: account.brandColor,
              }}
              className={classNames('mb-2 mt-2')}
            />
          ) : (
            account.logoUrl && (
              <img
                alt=""
                src={account.logoUrl}
                style={{
                  backgroundColor: account.brandColor,
                }}
                className={classNames('mb-2 mt-2')}
              />
            )
          )}
          <Button onClick={openFileDialog} disabled={!account.premium}>
            {files && files.length > 0 && files[0].progress < 100 && (
              <FontAwesomeIcon icon={faSpinner} spin={true} size="lg" />
            )}
            Upload file
          </Button>
        </PremiumCard>
        <PremiumCard isPremium={account.premium} className="h-full">
          <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
          <Description>
            You can collect data from your website with Google Analytics.
            <br />
            Enter a valid Analytics Property ID.
          </Description>
          <TextField
            placeholder="G-XXXXXXX or UA-XXXXXX-X"
            id="googleAnalyticsId"
            defaultValue={
              account.premium ? account.googleAnalyticsId : undefined
            }
            disabled={!account.premium}
            readOnly={!account.premium}
          />
        </PremiumCard>
      </>
    );

    const settingsComponent = (
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">{freeAccountSettings}</div>
          <div className="flex flex-col">{premiumAccountSettings}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Button block type="submit">
              Update
            </Button>
          </div>
          <div>
            {!account.premium ? (
              <Button
                block
                color="yellow"
                onClick={() => router.push('/settings/plans')}
              >
                Upgrade your account
              </Button>
            ) : (
              ''
            )}
          </div>
        </div>
      </form>
    );

    return (
      <DashboardLayout header="Settings">
        {settingsComponent}
        {slackSyncComponent}
      </DashboardLayout>
    );
  }
  return <Onboarding />;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: 'signin',
      },
    };
  }
  return {
    props: {
      session,
      account: account && serializeAccount(account),
    },
  };
}

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from 'components/layout/DashboardLayout';
import TextField from 'components/TextField';
import ColorField from 'components/ColorField';
import Button from 'components/Button';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { stripProtocol } from 'utilities/url';
import {
  faCirclePause,
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { toast } from 'components/Toast';
import { findAccountByEmail } from 'lib/models';
import { capitalize } from 'lib/util';
import BotButton from 'components/BotButton';
import Label from 'components/Label';
import CheckboxField from 'components/CheckboxField';
import classNames from 'classnames';
import { useS3Upload } from 'next-s3-upload';

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
  const [logoUrl, setLogoUrl] = useState<string>();
  const { FileInput, openFileDialog, uploadToS3, files } = useS3Upload();

  useEffect(() => {
    const error = router.query.error as string;
    if (error) {
      toast.error('Something went wrong, please try again');
      router.replace('/settings', undefined, { shallow: true });
    }
    const success = router.query.success as string;
    if (success) {
      toast.success(decodeURI(success));
      router.replace('/settings', undefined, { shallow: true });
    }
  }, [router.query]);

  if (!account) {
    return (
      <DashboardLayout header="Settings">
        <h1>You are not signed in.</h1>
      </DashboardLayout>
    );
  }

  const handleLogoChange = async (file: File) => {
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
    // free
    const homeUrl = form.homeUrl.value;
    const docsUrl = form.docsUrl.value;
    const redirectDomain = stripProtocol(form.redirectDomain.value);
    const anonymizeUsers = form.anonymizeUsers.checked;
    // premium
    const googleAnalyticsId = form.googleAnalyticsId?.value;
    const brandColor = form.brandColor?.value;
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        accountId: account.id,
        homeUrl,
        docsUrl,
        redirectDomain,
        anonymizeUsers,
        ...(account.premium && {
          logoUrl,
          brandColor,
          googleAnalyticsId,
        }),
      }),
    })
      .then((response) => response.json())
      .then(() => {
        toast.success('Saved successfully!');
      });
  };

  const slackSyncComponent = (
    <div className="py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 pb-4">
        {capitalize(account.communityType)} Synchronization
      </h1>
      {account.slackSyncStatus === 'NOT_STARTED' && (
        <div>
          <FontAwesomeIcon icon={faCirclePause} size="lg" /> Not started
        </div>
      )}
      {account.slackSyncStatus === 'IN_PROGRESS' && (
        <div>
          <FontAwesomeIcon icon={faSpinner} size="lg" /> In progress
        </div>
      )}
      {account.slackSyncStatus === 'DONE' && (
        <div>
          <FontAwesomeIcon icon={faCircleCheck} size="lg" color="green" /> Done
        </div>
      )}
      {account.slackSyncStatus === 'ERROR' && (
        <>
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} size="lg" color="red" />{' '}
            Error
          </div>
          <div className="flex flex-row">
            <div className="flex-initial">
              <BotButton communityType={account.communityType} />
            </div>
          </div>
        </>
      )}
    </div>
  );

  const logoUpload = (
    <>
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
        {logoUpload}
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
          defaultValue={account.premium ? account.googleAnalyticsId : undefined}
          disabled={!account.premium}
          readOnly={!account.premium}
        />
      </PremiumCard>
    </>
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

  const col = 'flex flex-col';
  const settingsComponent = (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className={col}>{freeAccountSettings}</div>
        <div className={col}>{premiumAccountSettings}</div>
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

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
      },
    };
  }
  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}

import React, { useEffect } from 'react';
import { NextPageContext } from 'next';
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

interface Props {
  account?: SerializedAccount;
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

  if (account) {
    const onSubmit = (event: any) => {
      event.preventDefault();
      const form = event.target;
      const homeUrl = form.homeUrl.value;
      const docsUrl = form.docsUrl.value;
      const redirectDomain = stripProtocol(form.redirectDomain.value);
      const googleAnalyticsId = form.googleAnalyticsId?.value;
      const brandColor = form.brandColor.value;
      fetch('/api/accounts', {
        method: 'PUT',
        body: JSON.stringify({
          accountId: account.id,
          homeUrl,
          docsUrl,
          redirectDomain,
          brandColor,
          googleAnalyticsId,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          toast.success('Saved successfully!');
        });
    };

    const slackSyncComponent = (
      <DashboardLayout
        header={`${capitalize(account.communityType)} Synchronization`}
      >
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
            <FontAwesomeIcon icon={faCircleCheck} size="lg" color="green" />{' '}
            Done
          </div>
        )}
        {account.slackSyncStatus === 'ERROR' && (
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} size="lg" color="red" />{' '}
            Error
          </div>
        )}
        <div className="flex flex-row">
          <div className="flex-initial">
            <BotButton communityType={account.communityType} />
          </div>
        </div>
      </DashboardLayout>
    );

    const settingsComponent = (
      <DashboardLayout header="Settings">
        <form onSubmit={onSubmit}>
          <TextField
            label="Home url"
            placeholder="https://yourwebsite.com"
            id="homeUrl"
            defaultValue={account.homeUrl}
            required
          />
          <TextField
            label="Docs url"
            placeholder="https://docs.yourwebsite.com"
            id="docsUrl"
            defaultValue={account.docsUrl}
            required
          />
          <TextField
            label="Redirect domain"
            placeholder="linen.yourwebsite.com"
            id="redirectDomain"
            defaultValue={account.redirectDomain}
            required
          />
          <ColorField
            label="Brand color"
            id="brandColor"
            defaultValue={account.brandColor}
            required
          />
          {account.premium && (
            <div className="py-8">
              <h3 className="font-bold font-xl mb-3">Premium</h3>
              <div className="p-3 rounded border-gray-200 border-solid border">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <p className="text-xs mb-2 text-gray-600">
                  You can collect data from your website with Google Analytics.
                  <br />
                  Enter a valid Analytics Property ID.
                </p>
                <TextField
                  placeholder="G-XXXXXXX or UA-XXXXXX-X"
                  id="googleAnalyticsId"
                  defaultValue={account.googleAnalyticsId}
                />
              </div>
            </div>
          )}
          <Button type="submit">Update</Button>
        </form>
      </DashboardLayout>
    );

    return (
      <BlankLayout>
        {settingsComponent}
        {slackSyncComponent}
      </BlankLayout>
    );
  }
  return (
    <DashboardLayout header="Settings">
      <h1>You are not signed in.</h1>
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

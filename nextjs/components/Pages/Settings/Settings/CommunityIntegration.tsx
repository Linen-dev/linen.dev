import '@fortawesome/fontawesome-svg-core/styles.css';
import CommunityButton from 'components/CommunityButton';
import { capitalize } from 'lib/util';
import { integrationAuthorizer } from 'utilities/communityAuthorizers';
import { SerializedAccount } from 'serializers/account';
import { toast } from 'components/Toast';
import {
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const statusMap: any = {
  NOT_STARTED: (
    <>
      <FontAwesomeIcon icon={faSpinner} spin className="h-5 w-5 mr-1" /> In
      progress
    </>
  ),
  IN_PROGRESS: (
    <>
      <FontAwesomeIcon icon={faSpinner} spin className="h-5 w-5 mr-1" /> In
      progress
    </>
  ),
  DONE: (
    <>
      <FontAwesomeIcon
        icon={faCircleCheck}
        color="green"
        className="h-5 w-5 mr-1"
      />
      Done
    </>
  ),
  ERROR: (
    <>
      <FontAwesomeIcon
        icon={faCircleExclamation}
        className="h-5 w-5 mr-1"
        color="red"
      />{' '}
      Error
    </>
  ),
};

export default function CommunityIntegration({
  account,
}: {
  account?: SerializedAccount;
}) {
  const newOnboarding = !account || !account.communityType;
  const communityType =
    account && account.communityType ? account.communityType : 'Slack/Discord';

  const onClick = async (community: string) => {
    try {
      const authResponse = await fetch('/api/auth', {
        method: 'PUT',
        body: JSON.stringify({
          createAccount: true,
        }),
      });
      if (!authResponse.ok) {
        throw 'create account failed';
      }
      const auth = await authResponse.json();
      community && integrationAuthorizer(community, auth.account.id);
    } catch (error) {
      return toast.error('Something went wrong, please sign in again');
    }
  };

  const syncStatus =
    !!account?.hasAuth &&
    !!account?.syncStatus &&
    statusMap[account.syncStatus];

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {capitalize(communityType)} integration
              {syncStatus && (
                <>
                  <span className="text-gray-300"> | </span>
                  {syncStatus}
                </>
              )}
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>
                  Connect to {capitalize(communityType)} to fetch conversations.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {newOnboarding ? (
              <div className="grid grid-cols-1 gap-4">
                <CommunityButton
                  communityType={'slack'}
                  label="Connect to"
                  onClick={onClick}
                  iconSize="20"
                />
                <CommunityButton
                  communityType={'discord'}
                  label="Connect to"
                  onClick={onClick}
                  iconSize="20"
                />
              </div>
            ) : (
              <CommunityButton
                communityType={communityType}
                label="Reconnect to"
                onClick={(community) =>
                  integrationAuthorizer(community, account.id)
                }
                iconSize="20"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

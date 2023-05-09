import CommunityButton from '@linen/ui/CommunityButton';
import H3 from '@linen/ui/H3';
import { capitalize } from '@linen/utilities/string';
import { qs } from '@linen/utilities/url';
import { SerializedAccount } from '@linen/types';
import Toast from '@linen/ui/Toast';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoAlert } from '@react-icons/all-files/go/GoAlert';
import { GoInfo } from '@react-icons/all-files/go/GoInfo';

const statusMap: any = {
  NOT_STARTED: (
    <>
      <GoInfo className="h-5 w-5 mr-1 inline" /> In progress
    </>
  ),
  IN_PROGRESS: (
    <>
      <GoInfo className="h-5 w-5 mr-1 inline" /> In progress
    </>
  ),
  DONE: (
    <>
      <GoCheck color="green" className="h-5 w-5 mr-1 inline" />
      Done
    </>
  ),
  ERROR: (
    <>
      <GoAlert className="h-5 w-5 mr-1 inline" color="red" /> Error
    </>
  ),
};

const integrationAuthorizer = (
  community: string,
  accountId: string
): Promise<{ url: string }> =>
  fetch(`/api/integration-oauth?${qs({ community, accountId })}`).then((e) =>
    e.json()
  );

export default function CommunityIntegration({
  currentCommunity,
}: {
  currentCommunity: SerializedAccount;
}) {
  const newOnboarding = !currentCommunity.communityType;
  const communityType = currentCommunity.communityType
    ? currentCommunity.communityType
    : 'Slack/Discord';

  const onClick = async (community: string) => {
    try {
      const { id } = currentCommunity;
      community &&
        integrationAuthorizer(community, id).then(({ url }) => {
          window.location.href = url;
        });
    } catch (error) {
      return Toast.error('Something went wrong, please sign in again');
    }
  };

  const syncStatus =
    !!currentCommunity.hasAuth &&
    !!currentCommunity.syncStatus &&
    statusMap[currentCommunity.syncStatus];

  return (
    <>
      <div className="flex">
        <div className="grow">
          <H3>
            {capitalize(communityType)} integration
            {syncStatus && (
              <>
                <span className="text-gray-300"> | </span>
                {syncStatus}
              </>
            )}
          </H3>
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
                integrationAuthorizer(community, currentCommunity.id).then(
                  ({ url }) => {
                    window.location.href = url;
                  }
                )
              }
              iconSize="20"
            />
          )}
        </div>
      </div>
    </>
  );
}

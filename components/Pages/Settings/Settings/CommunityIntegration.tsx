import CommunityButton from 'components/CommunityButton';
import { capitalize } from 'lib/util';
import { integrationAuthorizer } from 'utilities/communityAuthorizers';
import { SerializedAccount } from 'serializers/account';
import { toast } from 'components/Toast';

export default function CommunityIntegration({
  account,
}: {
  account?: SerializedAccount;
}) {
  const newOnboarding = !account || !account.communityType;
  const communityType =
    account && account.communityType ? account.communityType : 'Slack/Discord';

  const onSubmit = async (community: string) => {
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

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex">
          <div className="grow">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {capitalize(communityType)} integration
            </h3>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              </div>
            </div>
          </div>
          <div className="self-center">
            {newOnboarding ? (
              <div className="grid grid-cols-1 gap-4">
                <CommunityButton
                  communityType={'slack'}
                  label="Connect to"
                  onSubmit={onSubmit}
                  iconSize="20"
                />
                <CommunityButton
                  communityType={'discord'}
                  label="Connect to"
                  onSubmit={onSubmit}
                  iconSize="20"
                />
              </div>
            ) : (
              <CommunityButton
                communityType={communityType}
                label="Reconnect to"
                onSubmit={(community) =>
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

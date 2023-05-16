import CommunityButton from '@linen/ui/CommunityButton';
import Label from '@linen/ui/Label';
import { capitalize } from '@linen/utilities/string';
import { qs } from '@linen/utilities/url';
import { SerializedAccount } from '@linen/types';
import Toast from '@linen/ui/Toast';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoAlert } from '@react-icons/all-files/go/GoAlert';
import { GoInfo } from '@react-icons/all-files/go/GoInfo';
import { api } from 'utilities/requests';
import { useState } from 'react';
import styles from './index.module.scss';
import TextInput from '@linen/ui/TextInput';

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

function integrationAuthorizer({
  community,
  accountId,
  syncOpt,
  dateFrom,
}: {
  community: string;
  accountId: string;
  syncOpt?: 'since-all' | 'since-date';
  dateFrom?: string;
}): Promise<{ url: string }> {
  return api.get(
    `/api/integration-oauth?${qs({ community, accountId, syncOpt, dateFrom })}`
  );
}

export default function CommunityIntegration({
  currentCommunity,
}: {
  currentCommunity: SerializedAccount;
}) {
  const [syncOpt, setSyncOpt] = useState<'since-all' | 'since-date'>(
    'since-all'
  );
  const [dateFrom, setDateFrom] = useState<string>();
  const newOnboarding = !currentCommunity.communityType;
  const communityType = currentCommunity.communityType
    ? currentCommunity.communityType
    : 'Slack/Discord';

  const onClick = async (community: string) => {
    if (!community) {
      return;
    }

    try {
      const { id } = currentCommunity;
      integrationAuthorizer({
        community,
        accountId: id,
        dateFrom,
        syncOpt,
      }).then(({ url }) => {
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
      <Label htmlFor="integration">
        {capitalize(communityType)} integration
        {syncStatus && (
          <>
            <span className="text-gray-300"> | </span>
            {syncStatus}
          </>
        )}
        <Label.Description>
          Connect to {capitalize(communityType)} to fetch conversations.
        </Label.Description>
      </Label>
      <div>
        {newOnboarding ? (
          <>
            {SyncOptions(syncOpt, setSyncOpt, setDateFrom)}
            <div className="flex gap-2">
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
          </>
        ) : (
          <CommunityButton
            communityType={communityType}
            label="Reconnect to"
            onClick={(community) =>
              integrationAuthorizer({
                community,
                accountId: currentCommunity.id,
              }).then(({ url }) => {
                window.location.href = url;
              })
            }
            iconSize="20"
          />
        )}
      </div>
    </>
  );
}

function SyncOptions(
  syncOpt: string,
  setSyncOpt: React.Dispatch<React.SetStateAction<'since-all' | 'since-date'>>,
  setDateFrom: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  return (
    <div className={styles.radioWrapper}>
      <div key={'since-all'} className={styles.flexCenter}>
        <span className="checkmark"></span>
        <input
          id={'since-all'}
          name="sync-from"
          type="radio"
          defaultChecked={syncOpt === 'since-all'}
          onClick={() => {
            setSyncOpt('since-all');
          }}
          className={styles.radioInput}
        />
        <label htmlFor={'since-all'} className={styles.radioLabel}>
          Sync all history
        </label>
      </div>
      <div key={'since-date'} className={styles.flexCenter}>
        <span className="checkmark"></span>
        <input
          id={'since-date'}
          name="sync-from"
          type="radio"
          defaultChecked={syncOpt === 'since-date'}
          onClick={() => {
            setSyncOpt('since-date');
          }}
          className={styles.radioInput}
        />
        <label htmlFor={'since-date'} className={styles.radioLabel}>
          <div className={styles.radioLabelGroupDate}>
            <p>Sync from date</p>
            <TextInput
              type="date"
              id="id"
              disabled={syncOpt !== 'since-date'}
              readOnly={syncOpt !== 'since-date'}
              onChange={(e) => {
                setDateFrom(e.target.value);
              }}
            />
          </div>
        </label>
      </div>
    </div>
  );
}

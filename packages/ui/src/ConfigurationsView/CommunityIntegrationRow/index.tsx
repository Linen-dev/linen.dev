import CommunityButton from '@/CommunityButton';
import Label from '@/Label';
import { capitalize } from '@linen/utilities/string';
import { SerializedAccount } from '@linen/types';
import Toast from '@/Toast';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoAlert } from '@react-icons/all-files/go/GoAlert';
import { GoInfo } from '@react-icons/all-files/go/GoInfo';
import React, { useState } from 'react';
import styles from './index.module.scss';
import TextInput from '@/TextInput';
import type { ApiClient } from '@linen/api-client';

const statusMap: any = {
  NOT_STARTED: (
    <>
      <GoInfo className={styles.inlineStatus} /> In progress
    </>
  ),
  IN_PROGRESS: (
    <>
      <GoInfo className={styles.inlineStatus} /> In progress
    </>
  ),
  DONE: (
    <>
      <GoCheck color="green" className={styles.inlineStatus} />
      Done
    </>
  ),
  ERROR: (
    <>
      <GoAlert className={styles.inlineStatus} color="red" /> Error
    </>
  ),
};

export default function CommunityIntegration({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
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
      api
        .integrationAuthorizer({
          community,
          accountId: id,
          dateFrom,
          syncOpt,
        })
        .then(({ url }) => {
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
            <span className={styles.textGray300}> | </span>
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
            <SyncOptions
              syncOpt={syncOpt}
              setSyncOpt={setSyncOpt}
              setDateFrom={setDateFrom}
            />
            <div className={styles.flexGap2}>
              <CommunityButton
                communityType="slack"
                label="Connect to"
                onClick={onClick}
                iconSize="20"
              />
              <CommunityButton
                communityType="discord"
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
              api
                .integrationAuthorizer({
                  community,
                  accountId: currentCommunity.id,
                })
                .then(({ url }) => {
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

function SyncOptions({
  syncOpt,
  setSyncOpt,
  setDateFrom,
}: {
  syncOpt: string;
  setSyncOpt(prop: 'since-all' | 'since-date'): void;
  setDateFrom(prop: string | undefined): void;
}) {
  return (
    <div className={styles.radioWrapper}>
      <div key="since-all" className={styles.flexCenter}>
        <span className="checkmark"></span>
        <input
          id="since-all"
          name="sync-from"
          type="radio"
          defaultChecked={syncOpt === 'since-all'}
          onClick={() => {
            setSyncOpt('since-all');
          }}
          className={styles.radioInput}
        />
        <label htmlFor="since-all" className={styles.radioLabel}>
          Sync all history
        </label>
      </div>
      <div key="since-date" className={styles.flexCenter}>
        <span className="checkmark"></span>
        <input
          id="since-date"
          name="sync-from"
          type="radio"
          defaultChecked={syncOpt === 'since-date'}
          onClick={() => {
            setSyncOpt('since-date');
          }}
          className={styles.radioInput}
        />
        <label htmlFor="since-date" className={styles.radioLabel}>
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

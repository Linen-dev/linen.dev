import {
  AccountType,
  SerializedAccount,
  SerializedChannel,
} from '@linen/types';
import { Toast } from '@linen/ui';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
}

const updateAccount = debounce(
  ({ communityId, type }: { communityId: string; type: any }) => {
    api
      .updateAccount({
        accountId: communityId,
        type,
      })
      .then((_) => {
        Toast.success('Saved successfully!');
      })
      .catch(() => {
        Toast.error('Something went wrong!');
      });
  }
);

export default function Content({ channels, currentCommunity }: Props) {
  return (
    <div className={styles.container}>
      <CommunityIntegrationRow currentCommunity={currentCommunity} />
      <hr className="my-3" />
      {currentCommunity.communityType !== 'discord' && (
        <>
          <SlackImportRow currentCommunity={currentCommunity} />
          <hr className="my-3" />
        </>
      )}
      <AnonymizeUsersRow currentCommunity={currentCommunity} />
      <hr className="my-3" />
      <DefaultChannelRow
        channels={channels}
        currentCommunity={currentCommunity}
      />
      <hr className="my-3" />
      <ChannelVisibilityRow
        channels={channels}
        currentCommunity={currentCommunity}
      />
    </div>
  );
}

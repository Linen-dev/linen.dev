import { AccountType, SerializedAccount, ChatType } from '@linen/types';
import { Toast } from '@linen/ui';
import styles from './index.module.scss';
import UrlsRow from './UrlsRow';
import CommunityTypeRow from './CommunityTypeRow';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';
import CommunityChatRow from './CommunityChatRow';

interface Props {
  currentCommunity: SerializedAccount;
}

const updateAccount = debounce(
  ({
    communityId,
    type,
    chat,
  }: {
    communityId: string;
    type: any;
    chat: any;
  }) => {
    api
      .updateAccount({
        accountId: communityId,
        type,
        chat,
      })
      .then((_) => {
        Toast.success('Saved successfully!');
      })
      .catch(() => {
        Toast.error('Something went wrong!');
      });
  }
);

export default function Content({ currentCommunity }: Props) {
  return (
    <div className={styles.container}>
      <UrlsRow currentCommunity={currentCommunity} />
      <hr className="my-3" />
      <CommunityTypeRow
        type={currentCommunity.type}
        disabled={!currentCommunity.premium}
        onChange={(type: AccountType) => {
          updateAccount({ communityId: currentCommunity.id, type });
        }}
      />
      <hr className="my-3" />
      <CommunityChatRow
        chat={currentCommunity.chat}
        disabled={!currentCommunity.premium}
        onChange={(chat: ChatType) => {
          updateAccount({ communityId: currentCommunity.id, chat });
        }}
      />
    </div>
  );
}

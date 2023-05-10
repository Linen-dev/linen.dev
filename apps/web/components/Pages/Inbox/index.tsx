import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { InboxProps } from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import InboxView from '@linen/ui/InboxView';
import { api } from 'utilities/requests';
import { addReactionToThread } from 'utilities/state/reaction';
import JoinChannelLink from 'components/Link/JoinChannelLink';

export default function Inbox({
  channels,
  currentCommunity,
  communities,
  isSubDomainRouting,
  permissions,
  settings,
  dms,
}: InboxProps) {
  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'inbox',
    });
  }, [currentCommunity]);

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
      dms={dms}
    >
      <InboxView
        JoinChannelLink={JoinChannelLink}
        addReactionToThread={addReactionToThread}
        api={api}
        channels={channels}
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
        dms={dms}
      />
    </PageLayout>
  );
}

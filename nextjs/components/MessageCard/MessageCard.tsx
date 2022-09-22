import Avatars from '../Avatars';
import { users } from '@prisma/client';
import { getThreadUrl } from '../Pages/ChannelsPage/utilities/url';
import { SerializedMessage } from '../../serializers/message';
import CopyToClipboardIcon from '../Pages/ChannelsPage/CopyToClipboardIcon';
import type { Settings } from 'serializers/account/settings';
import Row from 'components/Message/Row';

export function MessageCard({
  incrementId,
  oldestMessage,
  authors,
  messages,
  isSubDomainRouting,
  settings,
  slug,
}: {
  incrementId: number;
  oldestMessage: SerializedMessage;
  authors: users[];
  messages: SerializedMessage[];
  isSubDomainRouting: boolean;
  settings: Settings;
  slug: string | null;
}) {
  return (
    <Row message={oldestMessage} communityType={settings.communityType}>
      <div className="flex flex-row items-center pt-2 pr-2">
        <div className="text-sm text-gray-400 flex flex-row items-center">
          <Avatars
            users={
              authors.map((a) => ({
                src: a.profileImageUrl,
                alt: a.displayName,
                text: (a.displayName || '?').slice(0, 1).toLowerCase(),
              })) || []
            }
          />
          {messages.length > 1 && (
            //Kam: Not sure about this blue but I wanted to add some color to make the page more interesting
            <div className="px-2 text-blue-800">
              {messages.length - 1} replies
            </div>
          )}
          {/* <div className="pl-2">{viewCount} Views</div> */}
        </div>
        {messages.length > 1 && (
          <CopyToClipboardIcon
            getText={() =>
              getThreadUrl({
                isSubDomainRouting,
                settings,
                incrementId,
                slug,
              })
            }
          />
        )}
      </div>
    </Row>
  );
}

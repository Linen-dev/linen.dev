import CustomLink from 'components/Link/CustomLink';
import {
  Permissions,
  SerializedThread,
  SerializedUser,
  Settings,
} from '@linen/types';

export function RowForBots({
  thread,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
  permissions,
  currentUser,
  Row,
}: {
  thread: SerializedThread;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId: number;
  slug: string | null;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  Row: (...args: any) => JSX.Element;
}) {
  const WithoutLink = ({ children }: any) => <>{children}</>;

  const Wrap = thread?.messages?.length > 1 ? CustomLink : WithoutLink;

  return (
    <Wrap
      isSubDomainRouting={isSubDomainRouting}
      communityName={settings.communityName}
      communityType={settings.communityType}
      path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
      key={`${incrementId}-desktop`}
    >
      <Row
        Actions={() => <></>}
        thread={thread}
        permissions={permissions}
        isSubDomainRouting={isSubDomainRouting}
        isBot={true}
        settings={settings}
        currentUser={currentUser}
      />
    </Wrap>
  );
}

import Header from '@linen/ui/Header';
import InternalLink from '../InternalLink';
import styles from './index.module.scss';
import { mockedComponent, mockedRouterAsPath } from '../../mock';
import { signOut } from '../SignOut';
import { useLinenStore, shallow } from '../../store';
import Loading from '../Loading';
import customUsePath from '../../hooks/usePath';
import { api } from '../../fetcher';

export default function NavTopBar() {
  const {
    channels,
    channelName,
    permissions,
    currentCommunity,
    settings,
    communityName,
  } = useLinenStore(
    (state) => ({
      channels: state.channels,
      channelName: state.channelName,
      permissions: state.permissions,
      currentCommunity: state.currentCommunity,
      settings: state.settings,
      communityName: state.communityName,
    }),
    shallow
  );

  if (!communityName || !settings || !currentCommunity || !permissions)
    return <Loading />;

  return (
    <>
      <div className={styles.push} />
      <div className={styles.header}>
        <Header
          {...{
            channels, // for mobile menu
            channelName, // for mobile menu
            signOut,
            permissions,
            settings,
            currentCommunity,
            // component injection
            put: api.put,
            postWithOptions: api.postWithOptions,
            Link: InternalLink({ communityName }),
            InternalLink: InternalLink({ communityName }),
            usePath: customUsePath({ communityName }),
            // TODO:
            routerAsPath: mockedRouterAsPath,
            JoinButton: mockedComponent,
            SearchBar: mockedComponent,
            // not sure
            isSubDomainRouting: false,
          }}
        />
      </div>
    </>
  );
}

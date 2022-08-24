import NativeSelect from 'components/NativeSelect';
import Card from 'components/Card';
import { channels } from '@prisma/client';
import ChannelName from './ChannelName';
import CustomLink from '../Link/CustomLink';
import { AiOutlineNumber } from 'react-icons/ai';
import CustomRouterPush from '../Link/CustomRouterPush';
import styles from './index.module.css';
import { sortByChannelName } from './utilities';

export default function NavBar({
  channelName,
  channels,
  communityName,
  communityType,
  isSubDomainRouting,
}: {
  channels: channels[];
  channelName: string;
  communityName: string;
  communityType: string;
  isSubDomainRouting: boolean;
}) {
  const onChangeChannel = (channelSelected: string) => {
    if (channelName && channelName !== channelSelected) {
      CustomRouterPush({
        isSubDomainRouting: isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${channelSelected}`,
      });
    }
  };

  const sortedChannels = sortByChannelName(channels);

  const navBarLg = (
    <div className="pl-2 w-[250px] pt-4 bg-slate-50">
      <h5 style={{ fontWeight: 'bold', paddingLeft: 18, marginBottom: 8 }}>
        Channels
      </h5>
      <div className="block overflow-hidden hover:overflow-auto h-[calc(100vh-160px)]">
        {sortedChannels.map((c: channels) => (
          <CustomLink
            isSubDomainRouting={isSubDomainRouting}
            communityName={communityName}
            communityType={communityType}
            key={c.channelName}
            path={`/c/${c.channelName}`}
            passHref
          >
            <div className="text-gray-800">
              <ChannelName
                name={c.channelName}
                active={c.channelName === channelName}
              />
            </div>
          </CustomLink>
        ))}
      </div>
      <a
        className="pl-4 text-gray-800 opacity-80 text-sm hover:text-blue-900 py-2"
        target="_blank"
        rel="noreferrer"
        href="https://www.linen.dev"
      >
        Powered by Linen
      </a>
    </div>
  );

  const navBarSm = (
    <div className="px-6">
      <NativeSelect
        id="channel"
        options={sortedChannels.map((channel: channels) => ({
          label: channel.channelName,
          value: channel.channelName,
        }))}
        icon={<AiOutlineNumber />}
        onChange={(event) => onChangeChannel(event.currentTarget.value)}
        label="Channels"
        value={channelName}
      />
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex bg-color-slate">{navBarLg}</div>
      <div className="lg:hidden">{navBarSm}</div>
    </>
  );
}

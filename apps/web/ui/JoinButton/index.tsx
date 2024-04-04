import JoinDiscord from './JoinDiscord';
import JoinSlack from './JoinSlack';
import { SerializedAccount, Settings } from '@linen/types';

interface WrapperProps {
  status: 'authenticated' | 'loading' | 'unauthenticated';
}

interface Props {
  brandColor?: string;
  fontColor: string;
  currentCommunity: SerializedAccount;
  settings: Settings;
}

export default function JoinButton({ status }: WrapperProps) {
  const fn = ({ brandColor, fontColor, currentCommunity, settings }: Props) => {
    if (status === 'loading') {
      return <div />;
    }

    return settings.communityType === 'discord' ? (
      <JoinDiscord
        brandColor={brandColor}
        fontColor={fontColor}
        href={settings.communityInviteUrl}
      />
    ) : (
      <JoinSlack
        brandColor={brandColor}
        fontColor={fontColor}
        href={settings.communityInviteUrl}
      />
    );
  };
  return fn;
}

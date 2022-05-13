import { CommunityType } from '@/serializers/account';
import DiscordBotButton from './DiscordBotButton';
import SlackBotButton from './SlackBotButton';

export default function BotButton({
  communityType,
}: {
  communityType: CommunityType;
}) {
  return communityType === CommunityType.discord ? (
    <DiscordBotButton />
  ) : (
    <SlackBotButton />
  );
}

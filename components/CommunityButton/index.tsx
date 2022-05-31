import { capitalize } from '@/lib/util';
import classNames from 'classnames';
import DiscordIcon from '../icons/DiscordIcon';
import SlackIcon from '../icons/SlackIcon';

interface CommunityButtonProps {
  communityType: string;
  onSubmit: (value: string) => void;
  iconSize?: string;
  label?: string;
  fontSize?: string;
}

export default function CommunityButton({
  onSubmit,
  communityType,
  iconSize = '25',
  label = 'Connect to',
  fontSize = 'text-base',
}: CommunityButtonProps) {
  const Icon = communityType === 'discord' ? DiscordIcon : SlackIcon;

  return (
    <button
      className={classNames(
        'flex rounded-md border p-2 justify-around border-gray-300',
        fontSize
      )}
      type="button"
      onClick={() => onSubmit(communityType)}
    >
      <div className="flex gap-2 items-center">
        <Icon size={iconSize} />
        <p>
          {label} <b>{capitalize(communityType)}</b>
        </p>
      </div>
    </button>
  );
}

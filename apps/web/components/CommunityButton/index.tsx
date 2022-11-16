import { capitalize } from 'utilities/string';
import classNames from 'classnames';
import DiscordIcon from '../icons/DiscordIcon';
import SlackIcon from '../icons/SlackIcon';

interface CommunityButtonProps {
  communityType: string;
  onClick: (value: string) => void;
  iconSize?: string;
  label?: string;
  fontSize?: string;
}

export default function CommunityButton({
  onClick,
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
      onClick={() => onClick(communityType)}
    >
      <div className="flex gap-2 items-center">
        <Icon size={iconSize} />
        <p className="whitespace-nowrap">
          {label} <b>{capitalize(communityType)}</b>
        </p>
      </div>
    </button>
  );
}

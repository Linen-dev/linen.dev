import DiscordIcon from '../../icons/DiscordIcon';

export default function JoinDiscord({ inviteUrl }: { inviteUrl?: string }) {
  return (
    <div>
      <a
        className="hidden sm:inline-flex items-center px-2 py-1 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-700"
        style={{ backgroundColor: 'white', minWidth: '200px' }}
        href={inviteUrl}
      >
        <DiscordIcon style={{ margin: '7px 10px 7px 5px' }} />
        Join the conversation
      </a>
      <a
        className="sm:hidden inline-flex items-center px-3 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-700"
        style={{ backgroundColor: 'white' }}
        href={inviteUrl}
      >
        <DiscordIcon style={{ margin: '5px 10px 5px 0px' }} />
        Join Discord
      </a>
    </div>
  );
}

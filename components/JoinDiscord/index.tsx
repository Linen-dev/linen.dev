import Image from 'next/image';
import discordLogo from '../../public/discord-logo.svg';

export default function JoinDiscord({ inviteUrl }: { inviteUrl?: string }) {
  return (
    <div>
      <a
        className="hidden sm:inline-flex items-center px-2 py-1 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-500"
        style={{ backgroundColor: 'white', minWidth: '200px' }}
        href={inviteUrl}
      >
        <Image src={discordLogo} height="30px" />
        Join the conversation
      </a>
      <a
        className="sm:hidden inline-flex items-center px-3 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-500"
        style={{ backgroundColor: 'white' }}
        href={inviteUrl}
      >
        <Image src={discordLogo} height="30px" /> Join Discord
      </a>
    </div>
  );
}

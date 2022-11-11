import SlackIcon from '../../icons/SlackIcon';

export default function JoinSlack({ inviteUrl }: { inviteUrl?: string }) {
  return (
    <div>
      <a
        className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-700"
        style={{ backgroundColor: 'white', minWidth: '200px' }}
        href={inviteUrl}
      >
        <SlackIcon style={{ marginRight: '10px' }} />
        Join the conversation
      </a>
      <a
        className="sm:hidden inline-flex items-center px-2 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-700 text-xs"
        style={{ backgroundColor: 'white' }}
        href={inviteUrl}
      >
        <SlackIcon style={{ marginRight: '10px' }} />
        Join Slack
      </a>
    </div>
  );
}

import styled from 'styled-components';
import { users } from '@prisma/client';
import Avatar, { Size } from '../../Avatar';
import Message from '../../Message';

const Container = styled.div({
  cursor: 'pointer',
  position: 'relative',
  borderBottom: '1px solid #eee',
  padding: '12px',
});

interface Props {
  body: string;
  mentions: any[];
  user?: users;
  channelName?: string;
}

export default function Suggestion({
  body,
  mentions,
  user,
  channelName,
}: Props) {
  return (
    <Container>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          marginBottom: '12px',
        }}
      >
        <Avatar
          size={Size.sm}
          src={user?.profileImageUrl || ''}
          alt={user?.displayName || ''}
          text={(user?.displayName || '?').slice(0, 1).toLowerCase()}
        />
        <div style={{ display: 'flex', marginLeft: '8px' }}>
          <strong style={{ fontSize: '14px' }}>{user?.displayName}</strong>
          {channelName && (
            <strong
              style={{ fontSize: '14px', position: 'absolute', right: '12px' }}
            >
              #{channelName}
            </strong>
          )}
        </div>
      </div>
      <div style={{ borderLeft: '3px solid #dfdfdf', paddingLeft: '16px' }}>
        <Message
          text={body}
          truncate
          mentions={mentions.map((m: any) => m.users) || []}
        />
      </div>
    </Container>
  );
}

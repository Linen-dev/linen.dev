import styled from 'styled-components';
import { channels, users } from '@prisma/client';
import { Group, Text } from '@mantine/core';
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
      <Group style={{ width: '100%', marginBottom: '12px' }}>
        <Avatar
          size={Size.sm}
          src={user?.profileImageUrl || ''}
          alt={user?.displayName || ''}
          text={(user?.displayName || '?').slice(0, 1).toLowerCase()}
        />
        <Group style={{ alignSelf: 'stretch' }} position="apart">
          <Text size="sm" weight="bold">
            {user?.displayName}
          </Text>
          {channelName && (
            <Text
              style={{ position: 'absolute', right: '12px' }}
              size="sm"
              weight="bold"
            >
              #{channelName}
            </Text>
          )}
        </Group>
      </Group>
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

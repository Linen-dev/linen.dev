import { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { Group, Text } from '@mantine/core';
import Avatar, { Size } from '../../components/Avatar';
import Message from '../Message';
import Autocomplete from '../Autocomplete';
import { messages, channels, users } from '@prisma/client';

const Suggestion = styled.div({
  cursor: 'pointer',
  position: 'relative',
  borderBottom: '1px solid #eee',
  padding: '12px',
});

const parseResults = (data: messages[]) => {
  const allIds = new Set();
  return data
    .map((r) => ({ ...r, value: r.body }))
    .filter((r) => {
      if (!r.slackThreadId) return false;
      if (allIds.has(r.id)) return false;
      allIds.add(r.id);
      return true;
    });
};

const SearchBar = ({
  channels = [],
  users = [],
}: {
  channels: channels[];
  users?: users[];
}) => {
  const accountId = channels[0]?.accountId;
  const [value, setValue] = useState('');
  const [selection, setSelection] = useState(null);
  const router = useRouter();

  const makeURL = (query = '') =>
    `/api/search?query=${encodeURIComponent(
      query.trim()
    )}&account_id=${accountId}`;

  const renderSuggestion = useCallback(
    ({ body, channelId, usersId, author }) => {
      const user = users.find((u) => u.id === usersId);
      const channel = channels.find((c) => c.id === channelId);
      const channelName = channel?.channelName;

      return (
        <Suggestion>
          <Group style={{ width: '100%', marginBottom: '12px' }}>
            <Avatar
              size={Size.sm}
              src={user?.profileImageUrl || ''} // set placeholder with a U sign
              alt={user?.displayName || ''} // Set placeholder of a slack user if missing
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
            <Message text={body} truncate author={author} />
          </div>
        </Suggestion>
      );
    },
    [users, channels]
  );

  const handleSelect = useCallback(
    ({ slackThreads }) => {
      router.push(
        `/t/${slackThreads.incrementId}/${slackThreads.slug || 'topic'}`
      );
    },
    [router]
  );

  return (
    <Autocomplete
      icon
      makeURL={makeURL}
      onSelect={handleSelect}
      resultParser={parseResults}
      renderSuggestion={renderSuggestion}
      placeholder={'Search messages'}
      // debounce={null}
      // limit={null}
    />
  );
};

export default SearchBar;

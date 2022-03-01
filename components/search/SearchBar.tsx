import { Autocomplete, Avatar, Group, Text } from '@mantine/core';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useCallback } from 'react';
import { forwardRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import Message from '../Message';

// eslint-disable-next-line react/display-name
const AutoCompleteItem = forwardRef(
  (
    { users, channels, channelId, slackThreadId, usersId, ...rest }: any,
    ref
  ) => {
    const user = users.find((u) => u.id === usersId);
    const channel = channels.find((c) => c.id === channelId);
    const channelName = channel?.channelName;
    return (
      <div style={{ position: 'relative' }} ref={ref} {...rest}>
        <Group style={{ width: '100%', marginBottom: '12px' }}>
          <Avatar
            radius="xl"
            size="sm"
            key={user?.id || user?.displayName}
            color="indigo"
            src={user?.profileImageUrl} // set placeholder with a U sign
            alt={user?.displayName} // Set placeholder of a slack user if missing
          >
            <Text style={{ marginTop: '-2px', fontSize: '14px' }}>
              {(user?.displayName || '?').slice(0, 1).toLowerCase()}
            </Text>
          </Avatar>
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
          <Message text={rest.body} truncate users={users} />
        </div>
      </div>
    );
  }
);

let lastReqTS;
const fetchResults = async (input, accountId) => {
  if (!input) return [];
  const reqTS = new Date().getTime();
  try {
    lastReqTS = reqTS;
    const res = await axios.get('/api/search', {
      params: {
        query: input,
        account_id: accountId,
      },
    });

    // We can get duplicate message ids back for some reason.
    const allIds = new Set();

    return {
      data: res.data.results
        .map((r) => ({ ...r, value: r.body }))
        .filter((r) => {
          if (!r.slackThreadId) return false;
          if (allIds.has(r.id)) return false;
          allIds.add(r.id);
          return true;
        }),
      reqTS,
    };
  } catch (e) {
    return { data: [], reqTS };
  }
};

export default function SearchBar({ channels = [], users = [] }) {
  const accountId = channels[0].accountId;
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getNewData = useDebouncedCallback(async (input) => {
    setIsLoading(true);
    const { data: newData = [], reqTS } =
      (await fetchResults(input, accountId)) || [];
    if (reqTS === lastReqTS) {
      setData(newData);
    }
    setIsLoading(false);
  }, 200);

  const handleInputChange = async (newValue) => {
    setValue(newValue);
    getNewData(newValue);
  };

  const handleSelect = useCallback(
    ({ slackThreadId, channelId, id }) => {
      router.push(`/channel/${channelId}/thread/${slackThreadId}#${id}`);
      setValue('');
    },
    [setValue, router]
  );

  return (
    <Autocomplete
      shadow="none"
      onItemSubmit={handleSelect}
      limit={5}
      nothingFound={
        value.length > 0 ? (
          <Text size="sm">
            {isLoading ? 'Searching...' : 'No search results found.'}
          </Text>
        ) : null
      }
      icon={<AiOutlineSearch />}
      style={{
        marginLeft: '40px',
        marginRight: '24px',
        maxWidth: '1000px',
        flex: '1 0 auto',
      }}
      itemComponent={({ ...rest }) => (
        <AutoCompleteItem channels={channels} users={users} {...rest} />
      )}
      value={value}
      onChange={handleInputChange}
      placeholder="Search messages"
      data={data}
    />
  );
}

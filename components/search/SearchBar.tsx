import { Autocomplete, Avatar, Group, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useCallback } from 'react';
import { forwardRef, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import Message from '../Message';

const AutoCompleteItem = forwardRef(
  ({ users, channels, channelId, slackThreadId, usersId, ...rest }, ref) => {
    const user = users.find((u) => u.id === usersId);
    const channel = channels.find((c) => c.id === channelId);
    const channelName = channel?.channelName;
    return (
      <div style={{ position: 'relative' }} ref={ref} {...rest}>
        <Group style={{ width: '100%', marginBottom: '12px' }}>
          <Avatar
            radius="xl"
            size="sm"
            key={user.id || user.displayName}
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

export default function SearchBar({ channels = [], users = [] }) {
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [debouncedValue] = useDebouncedValue(value, 150);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      const trimmedVal = debouncedValue.trim();
      if (trimmedVal) {
        const res = await fetch(
          `/api/search?query=${encodeURIComponent(trimmedVal)}`
        );
        const { results = [] } = await res.json();
        setData(
          results
            .map((r) => ({ ...r, value: r.body }))
            .filter((r) => !!r.slackThreadId)
        );
      } else {
        setData([]);
      }
    };
    fetchResults();
  }, [setData, debouncedValue]);

  const handleSelect = useCallback(
    ({ slackThreadId, channelId }) => {
      router.push(`/channel/${channelId}/thread/${slackThreadId}`);
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
          <Text size="sm">No search results found.</Text>
        ) : null
      }
      icon={<AiOutlineSearch />}
      style={{ marginLeft: '24px', marginRight: '24px', width: '600px' }}
      itemComponent={({ ...rest }) => (
        <AutoCompleteItem channels={channels} users={users} {...rest} />
      )}
      value={value}
      onChange={setValue}
      placeholder="Search Airbyte messages"
      data={data}
    />
  );
}

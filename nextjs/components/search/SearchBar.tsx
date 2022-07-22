import { useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Autocomplete from '../Autocomplete';
import { messages, channels, users } from '@prisma/client';
import Suggestion from './Suggestion';

const parseResults = (data: messages[]) => {
  const allIds = new Set();
  return data
    .map((r) => ({ ...r, value: r.body }))
    .filter((r) => {
      if (!r.threadId) return false;
      if (allIds.has(r.id)) return false;
      allIds.add(r.id);
      return true;
    });
};

const SearchBar = ({
  channels = [],
  users = [],
  communityName,
  isSubDomainRouting,
}: {
  channels: channels[];
  users?: users[];
  communityName: string;
  isSubDomainRouting: boolean;
}) => {
  const accountId = channels[0]?.accountId;
  const router = useRouter();

  const makeURL = (query = '', offset: number, limit: number) =>
    `/api/search?query=${encodeURIComponent(
      query.trim()
    )}&account_id=${accountId}&offset=${offset}&limit=${limit}`;

  const renderSuggestion = useCallback(
    ({ body, channelId, usersId, mentions }) => {
      const user = users.find((u) => u.id === usersId);
      const channel = channels.find((c) => c.id === channelId);
      const channelName = channel?.channelName;

      return (
        <Suggestion
          body={body}
          user={user}
          channelName={channelName}
          mentions={mentions}
        />
      );
    },
    [users, channels]
  );

  const handleSelect = useCallback(
    ({ threads }) => {
      let path = `/t/${threads.incrementId}/${threads.slug || 'topic'}`;
      if (!isSubDomainRouting) {
        path = `/s/${communityName}${path}`;
      }
      router.push(path);
    },
    [router]
  );

  const fetch = ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => {
    return axios
      .get(makeURL(query, offset, limit))
      .then((response) => parseResults(response.data));
  };

  return (
    <Autocomplete
      fetch={fetch}
      onSelect={handleSelect}
      renderSuggestion={renderSuggestion}
      placeholder="Search messages"
    />
  );
};

export default SearchBar;

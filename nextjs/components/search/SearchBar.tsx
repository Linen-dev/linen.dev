import { useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Autocomplete from '../Autocomplete';
import { messages, channels } from '@prisma/client';
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
  communityName,
  isSubDomainRouting,
  communityType,
}: {
  channels: channels[];
  communityName: string;
  isSubDomainRouting: boolean;
  communityType: string;
}) => {
  const accountId = channels[0]?.accountId;
  const router = useRouter();

  const makeURL = (query = '', offset: number, limit: number) =>
    `/api/search?query=${encodeURIComponent(
      query.trim()
    )}&account_id=${accountId}&offset=${offset}&limit=${limit}`;

  // TODO: Fetch user info from search query.
  // The first hacked together version literally loaded all the users
  // in the database from channels view
  const renderSuggestion = useCallback(
    ({ body, channelId, usersId, mentions }) => {
      const channel = channels.find((c) => c.id === channelId);
      const channelName = channel?.channelName;

      return (
        <Suggestion
          body={body}
          // user={}
          channelName={channelName}
          mentions={mentions}
          communityType={communityType}
        />
      );
    },
    [channels]
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

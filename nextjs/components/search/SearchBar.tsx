import { useCallback } from 'react';
import axios from 'axios';
import { MessageFormat } from '@prisma/client';
import { useRouter } from 'next/router';
import Autocomplete from '../Autocomplete';
import type { messages } from '@prisma/client';
import Suggestion from './Suggestion';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import styles from './index.module.css';
import { ChannelSerialized } from 'lib/channel';

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

interface SearchResult {
  body: string;
  channelId: string;
  usersId: string;
  mentions: SerializedUser[];
  messageFormat: MessageFormat;
}

const SearchBar = ({
  borderColor,
  channels = [],
  communityName,
  isSubDomainRouting,
  communityType,
}: {
  borderColor: string;
  channels: ChannelSerialized[];
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
    (searchResult: SearchResult) => {
      const { body, channelId, usersId, mentions, messageFormat } =
        searchResult;
      const channel = channels.find((c) => c.id === channelId);
      const channelName = channel?.channelName;

      return (
        <div className={styles.suggestion}>
          <Suggestion
            body={body}
            format={messageFormat}
            // user={}
            channelName={channelName}
            mentions={mentions}
          />
        </div>
      );
    },
    [channels]
  );

  const handleSelect = useCallback(
    ({ threads }: { threads: SerializedThread }) => {
      let path = `/t/${threads.incrementId}/${threads.slug || 'topic'}`;
      if (!isSubDomainRouting) {
        path = `/${
          communityType === 'discord' ? 'd' : 's'
        }/${communityName}${path}`;
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
      style={{ borderColor }}
    />
  );
};

export default SearchBar;

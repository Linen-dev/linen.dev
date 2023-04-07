import React from 'react';
import { useRouter } from 'next/router';
import Autocomplete from '../Autocomplete';
import type { messages } from '@linen/database';
import Suggestion from './Suggestion';
import {
  MessageFormat,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import styles from './index.module.css';

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
  user?: SerializedUser;
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
  channels: SerializedChannel[];
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

  const renderSuggestion = (searchResult: SearchResult) => {
    const { body, channelId, user, mentions, messageFormat } = searchResult;
    const channel = channels.find((c) => c.id === channelId);
    const channelName = channel?.channelName;

    return (
      <div className={styles.suggestion}>
        <Suggestion
          body={body}
          format={messageFormat}
          user={user}
          channelName={channelName}
          mentions={mentions}
        />
      </div>
    );
  };

  const handleSelect = ({ threads }: { threads: SerializedThread }) => {
    let path = `/t/${threads.incrementId}/${threads.slug || 'topic'}`;
    if (!isSubDomainRouting) {
      path = `/${
        communityType === 'discord' ? 'd' : 's'
      }/${communityName}${path}`;
    }
    router.push(path);
  };

  const fetchResults = ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => {
    return fetch(makeURL(query, offset, limit), { method: 'GET' })
      .then((response) => response.json())
      .then((response) => parseResults(response));
  };

  return (
    <Autocomplete
      fetch={fetchResults}
      onSelect={handleSelect}
      renderSuggestion={renderSuggestion}
      placeholder="Search"
      style={{ borderColor }}
    />
  );
};

export default SearchBar;

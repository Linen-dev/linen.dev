import React from 'react';
import Autocomplete from '@/Autocomplete';
import Suggestion from '@/Suggestion';
import type { SerializedChannel, SerializedSearchMessage } from '@linen/types';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';

const parseResults = (
  data: SerializedSearchMessage[]
): (SerializedSearchMessage & { value: string })[] => {
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
  className,
  brandColor,
  channels = [],
  accountId,
  api,
  handleSelect,
}: {
  className?: string;
  brandColor: string;
  channels: SerializedChannel[];
  accountId: string;
  api: ApiClient;
  handleSelect: (message: SerializedSearchMessage) => void;
}) => {
  const renderSuggestion = (searchResult: SerializedSearchMessage) => {
    const { body, channelId, author, mentions, messageFormat } = searchResult;
    const channel = channels.find((c) => c.id === channelId);
    const channelName = channel?.channelName;

    return (
      <div className={styles.suggestion}>
        <Suggestion
          body={body}
          format={messageFormat}
          user={author!}
          channelName={channelName}
          mentions={mentions}
        />
      </div>
    );
  };

  const fetchResults = async ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => {
    const response = await api.searchMessages({
      query,
      offset,
      limit,
      accountId,
    });
    return parseResults(response);
  };

  return (
    <Autocomplete
      className={className}
      brandColor={brandColor}
      fetch={fetchResults}
      onSelect={handleSelect}
      renderSuggestion={renderSuggestion}
      placeholder="Search"
    />
  );
};

export default SearchBar;

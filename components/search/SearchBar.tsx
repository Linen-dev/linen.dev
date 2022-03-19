import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Avatar from '../../components/Avatar';
import Message from '../Message';
import Autocomplete from '../Autocomplete';

const parseResults = (data) => {
  const allIds = new Set();
  return data.results
    .map((r) => ({ ...r, value: r.body }))
    .filter((r) => {
      if (!r.slackThreadId) return false;
      if (allIds.has(r.id)) return false;
      allIds.add(r.id);
      return true;
    });
};

const SearchBar = ({ channels = [], users = [] }) => {
  const accountId = channels[0]?.accountId;
  const [value, setValue] = useState('');
  const [selection, setSelection] = useState(null);
  const router = useRouter();

  const makeURL = (query = '') =>
    `/api/search?query=${encodeURIComponent(
      query.trim()
    )}&account_id=${accountId}`;

  const renderSuggestion = useCallback(
    ({ body, channelId, slackThreadId, usersId }) => {
      const user = users.find((u) => u.id === usersId);
      const channel = channels.find((c) => c.id === channelId);
      const channelName = channel?.channelName;

      return (
        <div
          className="p-3 cursor-pointer relative"
          style={{ borderBottom: '1px solid #eee' }}
        >
          <div className="flex items-center w-full mb-3">
            <Avatar
              size="sm"
              src={user?.profileImageUrl} // set placeholder with a U sign
              alt={user?.displayName} // Set placeholder of a slack user if missing
              text={(user?.displayName || '?').slice(0, 1).toLowerCase()}
            />
            <div className="font-bold text-sm flex items-center ml-2">
              {user?.displayName || 'John Doe'}
            </div>
            {channelName && (
              <div className="font-bold text-sm absolute right-3 top-4">
                #{channelName}
              </div>
            )}
          </div>
          <div className="pl-4" style={{ borderLeft: '3px solid #dfdfdf' }}>
            <Message text={body} truncate users={users} />
          </div>
        </div>
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
    />
  );
};

export default SearchBar;

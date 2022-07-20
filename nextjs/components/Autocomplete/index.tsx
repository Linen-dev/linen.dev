import { useEffect, useRef, useCallback, useState } from 'react';
import { Group, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { AiOutlineSearch } from 'react-icons/ai';
import Image from 'next/image';
import spinner from '../../public/spinner.svg';

const MIN_QUERY_LENGTH = 3;

export default function Autocomplete({
  fetch,
  onSelect = (any) => {},
  resultParser = (data) => data,
  renderSuggestion = (any) => null,
  placeholder = 'Search',
  debounce = 250,
  limit = 5,
}: {
  fetch: ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => Promise<{ data: object[] }>;
  onSelect: (any: any) => any;
  resultParser: (data: any) => any;
  renderSuggestion: (any: any) => any;
  placeholder: string;
  debounce?: number;
  limit?: number;
}) {
  const [value, setValue] = useState('');
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState([]);
  const [isFocused, setFocused] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [isLoadMoreVisible, setLoadMoreVisible] = useState(true);
  const [activeResult, setActiveResult] = useState(-1);
  const lastRequest: any = useRef(null);
  const [debouncedValue] = useDebouncedValue(value, debounce);
  const inputRef: any = useRef(null);

  // this effect will be fired every time debounced changes
  useEffect(() => {
    // setting min length for value
    lastRequest.current = debouncedValue;
    if (debouncedValue.length >= MIN_QUERY_LENGTH) {
      // updating the ref variable with the current debouncedValue
      setSearching(true);
      fetch({ query: debouncedValue, offset, limit })
        .then((r) => {
          // the code in here is asyncronous so debouncedValue
          // that was used when calling the api might be outdated
          // that's why we compare it to the value contained in the ref,
          // because the ref is never outdated (it's mutable)
          if (lastRequest.current === debouncedValue) {
            setSearching(false);
            setActiveResult(-1);
            if (offset > 0) {
              setResults([...results, ...resultParser(r.data)] as any);
            } else {
              setResults(resultParser(r.data));
            }
            setLoadMoreVisible(r.data.length >= limit);
          } else {
            // Discard API response because it's not most recent.
          }
        })
        .catch((e) => {
          setSearching(false);
          console.error(e);
        });
    } else {
      setResults([]);
    }
  }, [debouncedValue, fetch, resultParser, offset, limit]);

  const handleFocus = useCallback(() => {
    if (!isFocused) {
      setFocused(true);
    }
  }, [isFocused, setFocused]);

  const handleBlur = useCallback(() => {
    if (isFocused) {
      setFocused(false);
    }
  }, [isFocused, setFocused]);

  const handleSelect = useCallback(() => {
    if (activeResult >= 0 && onSelect) {
      inputRef.current?.blur();
      onSelect(results[activeResult]);
    }
  }, [activeResult, onSelect, results]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (activeResult !== results.length - 1) {
            e.preventDefault();
            setActiveResult(activeResult + 1);
          } else if (activeResult >= 0) {
            e.preventDefault();
            setActiveResult(0);
          }
          break;
        case 'ArrowUp':
          if (activeResult !== 0) {
            e.preventDefault();
            setActiveResult(activeResult - 1);
          } else if (activeResult >= 0) {
            e.preventDefault();
            setActiveResult(results.length - 1);
          }
          break;
        case 'Enter':
          if (activeResult >= 0) {
            handleSelect();
          }
          break;
        case 'Escape':
          inputRef.current?.blur();
          break;
      }
    },
    [handleSelect, setActiveResult, activeResult, results]
  );

  function renderSuggestions(results: any[]) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {results.map((r: any, idx: number) => (
          <div
            key={r.id || idx}
            onMouseEnter={() => setActiveResult(idx)}
            style={{
              backgroundColor: activeResult === idx ? '#f7f9fd' : 'white',
              width: '100%',
            }}
          >
            {renderSuggestion(r)}
          </div>
        ))}
        {isLoadMoreVisible && (
          <a
            onMouseEnter={() => setActiveResult(-1)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOffset((offset) => offset + limit);
            }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8e959f',
              padding: '10px',
              width: '100%',
              fontSize: '14px',
            }}
          >
            Load more
          </a>
        )}
      </div>
    );
  }

  return (
    <Group
      style={{
        position: 'relative',
        flex: '1 1 auto',
        margin: '0 24px',
        zIndex: 100,
      }}
      grow
      noWrap
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setActiveResult(-1)}
    >
      <TextInput
        ref={inputRef}
        style={{ maxWidth: 'unset' }}
        icon={<AiOutlineSearch />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          setOffset(0);
        }}
      />
      {isFocused && value.length >= MIN_QUERY_LENGTH && (
        <Group
          spacing={0}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect();
          }}
          style={{
            backgroundColor: 'white',
            overflow: 'auto',
            maxWidth: 'unset',
            borderRadius: '4px',
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            boxShadow: '2px 3px 7px rgba(0, 0, 0, 0.15)',
            maxHeight: 'calc(100vh - 200px)',
          }}
          direction="column"
        >
          {results.length > 0 && renderSuggestions(results)}
          {results.length === 0 && (
            <Text
              style={{ padding: '12px', textAlign: 'center', color: '#888' }}
              size="sm"
            >
              {isSearching ? (
                <div className="flex flex-row space-x-2 justify-center">
                  <Image src={spinner} width="20" height="20" />{' '}
                  <p>loading...</p>
                </div>
              ) : (
                'No results found.'
              )}
            </Text>
          )}
        </Group>
      )}
    </Group>
  );
}

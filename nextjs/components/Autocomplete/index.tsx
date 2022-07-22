import { useEffect, useRef, useCallback, useState } from 'react';
import debounce from 'awesome-debounce-promise';
import TextInput from 'components/TextInput';
import { AiOutlineSearch, AiOutlineLoading } from 'react-icons/ai';

export default function Autocomplete({
  fetch,
  onSelect = (any) => {},
  renderSuggestion = (any) => null,
  placeholder = 'Search',
  limit = 5,
  minlength = 3,
}: {
  fetch: ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => Promise<object[]>;
  onSelect: (any: any) => any;
  renderSuggestion: (any: any) => any;
  placeholder?: string;
  limit?: number;
  minlength?: number;
}) {
  const [value, setValue] = useState('');
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState([] as object[]);
  const [isFocused, setFocused] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [isMounted, setMounted] = useState(false);
  const [isLoadMoreVisible, setLoadMoreVisible] = useState(true);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const inputRef: any = useRef(null);

  const debouncedFetch = useCallback(
    debounce(fetch, 250, { leading: true }),
    []
  );

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  // this effect will be fired every time debounced changes
  useEffect(() => {
    // setting min length for value
    if (value.length >= minlength) {
      setSearching(true);
      debouncedFetch({ query: value, offset, limit })
        .then((data) => {
          if (!isMounted) {
            return;
          }
          setSearching(false);
          setActiveResultIndex(-1);
          if (offset > 0) {
            setResults((results) => [...results, ...data]);
          } else {
            setResults([...data]);
          }
          setLoadMoreVisible(data.length >= limit);
        })
        .catch((e) => {
          if (!isMounted) {
            return;
          }
          setSearching(false);
          console.error(e);
        });
    } else {
      setResults([]);
    }
  }, [value, fetch, offset, limit]);

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
    if (activeResultIndex >= 0 && onSelect) {
      inputRef.current?.blur();
      onSelect(results[activeResultIndex]);
    }
  }, [activeResultIndex, onSelect, results]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (activeResultIndex !== results.length - 1) {
            e.preventDefault();
            setActiveResultIndex(activeResultIndex + 1);
          } else if (activeResultIndex >= 0) {
            e.preventDefault();
            setActiveResultIndex(0);
          }
          break;
        case 'ArrowUp':
          if (activeResultIndex !== 0) {
            e.preventDefault();
            setActiveResultIndex(activeResultIndex - 1);
          } else if (activeResultIndex >= 0) {
            e.preventDefault();
            setActiveResultIndex(results.length - 1);
          }
          break;
        case 'Enter':
          if (activeResultIndex >= 0) {
            handleSelect();
          }
          break;
        case 'Escape':
          inputRef.current?.blur();
          break;
      }
    },
    [handleSelect, setActiveResultIndex, activeResultIndex, results]
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
            onMouseEnter={() => setActiveResultIndex(idx)}
            style={{
              backgroundColor: activeResultIndex === idx ? '#f7f9fd' : 'white',
              width: '100%',
            }}
          >
            {renderSuggestion(r)}
          </div>
        ))}
        {isLoadMoreVisible && (
          <a
            onMouseEnter={() => setActiveResultIndex(-1)}
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
    <div
      style={{
        position: 'relative',
        flex: '1 1 auto',
        margin: '0 24px',
        zIndex: 100,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setActiveResultIndex(-1)}
    >
      <TextInput
        id="search"
        inputRef={inputRef}
        icon={
          isSearching ? (
            <AiOutlineLoading className="fa-spin" />
          ) : (
            <AiOutlineSearch />
          )
        }
        placeholder={placeholder}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.currentTarget.value);
          setOffset(0);
        }}
      />
      {isFocused && value.length >= minlength && (
        <div
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
        >
          {results.length > 0 && renderSuggestions(results)}
          {results.length === 0 && !isSearching && (
            <p
              style={{
                fontSize: '14px',
                margin: 0,
                padding: '12px',
                textAlign: 'left',
                color: '#888',
              }}
            >
              No results found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

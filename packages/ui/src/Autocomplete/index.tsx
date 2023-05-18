import React, { useEffect, useRef, useCallback, useState } from 'react';
import classNames from 'classnames';
import debounce from '@linen/utilities/debounce';
import TextInput from '@/TextInput';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import { FiLoader } from '@react-icons/all-files/fi/FiLoader';
import styles from './index.module.scss';
import NoResults from './NoResults';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import type { SerializedSearchMessage } from '@linen/types';

export default function Autocomplete({
  className,
  brandColor,
  fetch,
  onSelect = (any) => {},
  renderSuggestion = (any, active) => null,
  placeholder = 'Search',
  limit = 5,
  minlength = 3,
  style,
}: {
  className?: string;
  brandColor: string;
  fetch: ({
    query,
    offset,
    limit,
  }: {
    query: string;
    offset: number;
    limit: number;
  }) => Promise<
    (SerializedSearchMessage & {
      value: string;
    })[]
  >;
  onSelect: (message: SerializedSearchMessage) => void;
  renderSuggestion: (any: any, active: boolean) => any;
  placeholder?: string;
  limit?: number;
  minlength?: number;
  style?: object;
}) {
  const [value, setValue] = useState('');
  const [offset, setOffset] = useState(0);
  const [results, setResults] = useState<SerializedSearchMessage[]>([]);
  const [isFocused, setFocused] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [isMounted, setMounted] = useState(false);
  const [isLoadMoreVisible, setLoadMoreVisible] = useState(true);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const inputRef: any = useRef(null);

  const debouncedFetch = useCallback(debounce(fetch, 250), []);

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
        .catch((exception: Error) => {
          if (!isMounted) {
            return;
          }
          setSearching(false);
          console.error(exception);
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
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          if (activeResultIndex !== results.length - 1) {
            event.preventDefault();
            setActiveResultIndex(activeResultIndex + 1);
          } else if (activeResultIndex >= 0) {
            event.preventDefault();
            setActiveResultIndex(0);
          }
          break;
        case 'ArrowUp':
          if (activeResultIndex !== 0) {
            event.preventDefault();
            setActiveResultIndex(activeResultIndex - 1);
          } else if (activeResultIndex >= 0) {
            event.preventDefault();
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
            className={classNames({
              [styles.active]: activeResultIndex === idx,
            })}
            style={{
              width: '100%',
            }}
          >
            {renderSuggestion(r, activeResultIndex === idx)}
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

  //when it is focused the font color should be black
  //when it is focused the background color should be white
  //when it is not focused and the brand color is light the font color should be black
  //when it is not focused and the brand color is dark the font color should be white

  const fontColor = (brandColor: string) => {
    if (isFocused) return 'black';
    //gray-100
    //gray-900
    return pickTextColorBasedOnBgColor(brandColor, '#f3f4f6', '#111827');
  };

  return (
    <div
      className={classNames(styles.container, className)}
      style={{
        color: fontColor(brandColor),
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setActiveResultIndex(-1)}
    >
      {isFocused && value.length >= minlength && results.length > 0 && (
        <div className={styles.overlay}></div>
      )}
      {isFocused &&
        value.length >= minlength &&
        results.length === 0 &&
        !isSearching && <div className={styles.overlay}></div>}
      <TextInput
        className={styles.input}
        id="search"
        inputRef={inputRef}
        icon={isSearching ? <FiLoader className={styles.spin} /> : <FiSearch />}
        placeholder={placeholder}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.currentTarget.value);
          setOffset(0);
        }}
        style={style}
      />
      {isFocused && value.length >= minlength && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelect();
          }}
        >
          {results.length > 0 && (
            <div className={styles.suggestions}>
              {renderSuggestions(results)}
            </div>
          )}
          {results.length === 0 && !isSearching && (
            <div className={classNames(styles.suggestions)}>
              <NoResults search={value} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

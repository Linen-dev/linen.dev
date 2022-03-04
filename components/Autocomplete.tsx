import axios from 'axios';
import { useEffect, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import { Group, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { AiOutlineSearch } from 'react-icons/ai';
import Message from './Message';

const MIN_QUERY_LENGTH = 3;

const IconWrapper = styled.div({
  position: 'absolute',
  top: '12px',
  left: 0,
});

export default function Autocomplete({
  icon,
  makeURL = () => '',
  onSelect = () => {},
  resultParser = (data) => data,
  renderSuggestion = () => null,
  placeholder = 'Search',
  debounce = 150,
  limit = 5,
}) {
  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setFocused] = useState(false);
  const [isSearching, setSearching] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const lastRequest = useRef(null);
  const [debouncedValue] = useDebouncedValue(value, debounce);
  const inputRef = useRef(null);

  // this effect will be fired every time debounced changes
  useEffect(() => {
    // setting min length for value
    lastRequest.current = debouncedValue;
    if (debouncedValue.length >= MIN_QUERY_LENGTH) {
      // updating the ref variable with the current debouncedValue
      setSearching(true);
      axios
        .get(makeURL(debouncedValue))
        .then((r) => {
          // the code in here is asyncronous so debouncedValue
          // that was used when calling the api might be outdated
          // that's why we compare it to the value contained in the ref,
          // because the ref is never outdated (it's mutable)
          if (lastRequest.current === debouncedValue) {
            setSearching(false);
            setActiveResult(-1);
            setResults(resultParser(r.data));
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
  }, [debouncedValue, makeURL, resultParser]);

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

  return (
    <Group
      style={{
        position: 'relative',
        flex: '1 1 auto',
        margin: '0 24px 0 40px',
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
        icon={icon && <AiOutlineSearch />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
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
            overflow: 'hidden',
            maxWidth: 'unset',
            borderRadius: '4px',
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            boxShadow: '2px 3px 7px rgba(0, 0, 0, 0.15)',
            alignItems: 'stretch',
          }}
          direction="column"
        >
          {results.length > 0 &&
            results.slice(0, limit).map((r, idx) => (
              <div
                key={r.id || idx}
                onMouseEnter={() => setActiveResult(idx)}
                style={{
                  backgroundColor: activeResult === idx ? '#f7f9fd' : 'white',
                }}
              >
                {renderSuggestion(r)}
              </div>
            ))}
          {results.length === 0 && (
            <Text
              style={{ padding: '12px', textAlign: 'center', color: '#888' }}
              size="sm"
            >
              {isSearching ? 'Searching...' : 'No results found.'}
            </Text>
          )}
        </Group>
      )}
    </Group>
  );
}

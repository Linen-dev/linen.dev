import { matches } from './search';

describe('matches function', () => {
  it('returns true when query is an empty string', () => {
    expect(matches('', 'any title')).toBeTruthy();
  });

  it('returns true when query is found in title (case insensitive)', () => {
    expect(matches('query', 'This is a QUERY string')).toBeTruthy();
  });

  it('returns true when query and title are both empty strings', () => {
    expect(matches('', '')).toBeTruthy();
  });

  it('handles case sensitivity properly', () => {
    expect(matches('Query', 'query String')).toBeTruthy();
    expect(matches('QUERY', 'query String')).toBeTruthy();
    expect(matches('query', 'Query String')).toBeTruthy();
  });

  it('returns false for non-matching strings with different cases', () => {
    expect(matches('QUERY', 'Different String')).toBeFalsy();
  });

  it('returns false when query is not found in title', () => {
    expect(matches('notfound', 'This is a title')).toBeFalsy();
  });

  it('returns false when title is empty', () => {
    expect(matches('a', '')).toBeFalsy();
  });
});

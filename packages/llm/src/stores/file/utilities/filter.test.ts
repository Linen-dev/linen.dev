import { isFileValid } from './filter';

describe('#isFileValid', () => {
  it('returns true for a valid file without any issues', () => {
    const validFile = {
      metadata: {
        source: 'https://foo.com/hello.html',
        title: 'Documentation',
      },
      pageContent: 'Valid content without JavaScript message',
    };
    expect(isFileValid(validFile)).toBe(true);
  });

  it('returns false when the file has /legacy/ in the url', () => {
    expect(
      isFileValid({ metadata: { source: 'https://foo.com/legacy/foo.html' } })
    ).toEqual(false);
  });

  it('returns false when the file has the version in the url', () => {
    expect(
      isFileValid({ metadata: { source: 'https://foo.com/v1.0.0/foo.html' } })
    ).toEqual(false);
    expect(
      isFileValid({
        metadata: { source: 'https://foo.com/v2.0.17/foo.html' },
      })
    ).toEqual(false);
    expect(
      isFileValid({
        metadata: { source: 'https://foo.com/v2.0/foo.html' },
      })
    ).toEqual(false);
  });

  it('returns false when the file has 404 not found text in the title', () => {
    expect(isFileValid({ metadata: { title: '404 Not Found' } })).toEqual(
      false
    );
    expect(isFileValid({ metadata: { title: '404 not found' } })).toEqual(
      false
    );
  });

  it('returns false for a file with JavaScript message in page content', () => {
    const file = {
      metadata: {
        source: 'https://foo.com/latest/bar.html',
        title: 'Documentation',
      },
      pageContent:
        'Just a moment...\n\nEnable JavaScript and cookies to continue',
    };
    expect(isFileValid(file)).toBe(false);
  });

  it('should return false for a file with empty metadata and page content', () => {
    const file = {
      metadata: {},
      pageContent: '',
    };
    expect(isFileValid(file)).toBe(false);
  });
});

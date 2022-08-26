import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Link from '.';
import styles from './index.module.scss';

jest.mock(
  './Tweet',
  () =>
    function foo() {
      return <div>Tweet</div>;
    }
);

jest.mock('components/Image/utilities', () => ({
  preload: jest
    .fn()
    .mockResolvedValue({ naturalWidth: 100, naturalHeight: 100 }),
}));

describe('Link', () => {
  it('renders it', () => {
    const { getByText } = render(<Link value="https://foo.com" />);
    const link = getByText('https://foo.com') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
    expect(link.rel).toEqual('noreferrer ugc');
  });

  describe('when link has an optional text', () => {
    it('renders a custom link text', () => {
      const { getByText } = render(<Link value="https://foo.com|bar" />);
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });
  });

  describe('when the link points to an image', () => {
    it('renders it', async () => {
      const { getByAltText } = render(
        <Link value="https://foo.com/image.png" />
      );
      await waitFor(() => {
        const image = getByAltText(
          'https://foo.com/image.png'
        ) as HTMLImageElement;
        expect(image.src).toEqual('https://foo.com/image.png');
      });
    });
  });

  //Disabling twitter card for now since it doesn't play well with mobile view
  describe('when the link points to a tweet', () => {
    it.skip('renders it', async () => {
      const { getByText } = render(
        <Link value="https://twitter.com/status/1234" />
      );
      expect(getByText('Tweet')).toBeInTheDocument();
    });
  });

  describe('when the link is not valid', () => {
    it('renders a line through', () => {
      const { getByText } = render(
        <Link value="https://-how-to-register|foo" />
      );
      const link = getByText('foo');
      expect(link).toHaveClass(styles.line);
    });
  });
});

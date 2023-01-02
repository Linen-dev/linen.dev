import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Link from '.';
import styles from './index.module.scss';

jest.mock('../../Image/utilities/preload', () =>
  jest.fn().mockResolvedValue({ naturalWidth: 100, naturalHeight: 100 })
);

describe('Link', () => {
  it('renders it', () => {
    const { getByText } = render(<Link url="https://foo.com" title="https://foo.com" />);
    const link = getByText('https://foo.com') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
    expect(link.rel).toEqual('noreferrer ugc');
  });

  describe('when link has an optional text', () => {
    it('renders a custom link text', () => {
      const { getByText } = render(<Link url="https://foo.com" title="bar" />);
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });
  });

  describe('when the link points to an image', () => {
    it('renders it', async () => {
      const { container } = render(<Link url="https://foo.com/image.png" title="https://foo.com/image.png" />);
      await waitFor(() => {
        const link = container.querySelector('a') as HTMLAnchorElement;
        expect(link.href).toEqual('https://foo.com/image.png');
      });
    });
  });

  describe('when the link is not valid', () => {
    it('renders a line through', () => {
      const { getByText } = render(
        <Link url="https://-how-to-register" title="foo" />
      );
      const link = getByText('foo');
      expect(link).toHaveClass(styles.line);
    });
  });
});

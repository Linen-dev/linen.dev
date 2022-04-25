import React from 'react';
import { render } from '@testing-library/react';
import Link from '.';

describe('Link', () => {
  it('renders it', () => {
    const { getByText } = render(<Link value="https://foo.com" />);
    const link = getByText('https://foo.com') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
  });

  describe('when link has an optional text', () => {
    it('renders a custom link text', () => {
      const { getByText } = render(<Link value="https://foo.com|bar" />);
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });
  });

  describe('when the link points to an image', () => {
    it('renders it', () => {
      const { getByAltText } = render(
        <Link value="https://foo.com/image.png" />
      );
      const image = getByAltText(
        'https://foo.com/image.png'
      ) as HTMLImageElement;
      expect(image.src).toEqual('https://foo.com/image.png');
    });
  });
});

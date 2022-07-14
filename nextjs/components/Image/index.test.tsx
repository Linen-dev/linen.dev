import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Image from '.';

jest.mock('./utilities', () => ({
  preload: jest
    .fn()
    .mockResolvedValue({ naturalHeight: 100, naturalWidth: 100 }),
}));

describe('Image', () => {
  it('renders an image', async () => {
    const { getByAltText } = render(
      <Image src="https://example.com/image.png" alt="foo" />
    );
    await waitFor(() => expect(getByAltText('foo')).toBeInTheDocument());
  });
});

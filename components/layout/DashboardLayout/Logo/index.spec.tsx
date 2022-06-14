import React from 'react';
import { render } from '@testing-library/react';
import Logo from '.';

describe('Logo', () => {
  it('renders a logo with an alt attribute', () => {
    const { getByAltText } = render(<Logo />);
    expect(getByAltText('Linen logo')).toBeInTheDocument();
  });
});

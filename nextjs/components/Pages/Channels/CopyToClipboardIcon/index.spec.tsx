import React from 'react';
import CopyToClipboardIcon from '.';
import { render } from '@testing-library/react';

describe('CopyToClipboardIcon', () => {
  it('renders a clip icon', () => {
    const { container } = render(<CopyToClipboardIcon text="foo" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

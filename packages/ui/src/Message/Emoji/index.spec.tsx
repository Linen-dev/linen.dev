import React from 'react';
import { render } from '@testing-library/react';
import Emoji from '.';

describe.skip('Emoji', () => {
  it('renders emojis', () => {
    const { container } = render(<Emoji text="Hello :)" />);
    expect(container).toHaveTextContent('😃');
    expect(container).not.toHaveTextContent(':)');
  });
});

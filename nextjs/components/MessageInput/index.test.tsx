import React from 'react';
import { render } from '@testing-library/react';
import MessageInput from '.';

describe('MessageInput', () => {
  it('renders a textarea', () => {
    const { container } = render(<MessageInput name="foo" />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });
});

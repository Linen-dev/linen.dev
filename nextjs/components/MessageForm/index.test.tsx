import React from 'react';
import { render } from '@testing-library/react';
import MessageForm from '.';

describe('MessageForm', () => {
  it('renders a textarea', () => {
    const { getByPlaceholderText } = render(<MessageForm />);
    const textarea = getByPlaceholderText('Type something...');
    expect(textarea).toBeInTheDocument();
  });
});

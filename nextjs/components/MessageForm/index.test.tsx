import React from 'react';
import { render } from '@testing-library/react';
import MessageForm from '.';

describe('MessageForm', () => {
  it('renders a textarea', () => {
    const { getByPlaceholderText } = render(<MessageForm />);
    const textarea = getByPlaceholderText('Add your comment...');
    expect(textarea).toBeInTheDocument();
  });
});

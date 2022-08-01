import React from 'react';
import { render } from '@testing-library/react';
import Alert from '.';

describe('Alert', () => {
  it('renders the text', () => {
    const { container } = render(<Alert type="danger">Lorem ipsum</Alert>);
    expect(container).toHaveTextContent('Lorem ipsum');
  });
});

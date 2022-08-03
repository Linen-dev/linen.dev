import React from 'react';
import { render } from '@testing-library/react';
import Alert from '.';

describe('Alert', () => {
  it('renders the text for a danger alert', () => {
    const { container } = render(<Alert type="danger">Lorem ipsum</Alert>);
    expect(container).toHaveTextContent('Lorem ipsum');
  });

  it('renders the text for an info alert', () => {
    const { container } = render(<Alert type="info">Lorem ipsum</Alert>);
    expect(container).toHaveTextContent('Lorem ipsum');
  });
});

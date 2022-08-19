import React from 'react';
import { render } from '@testing-library/react';
import MessageField from '.';

describe('MessageField', () => {
  it('renders a textarea', () => {
    const { container } = render(<MessageField name="foo" />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('renders a label', () => {
    const { container } = render(<MessageField label="foo" name="bar" />);
    expect(container).toHaveTextContent('foo');
  });
});

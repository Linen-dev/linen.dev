import React from 'react';
import { render } from '@testing-library/react';
import Textarea from '.';

describe('Textarea', () => {
  it('renders a textarea', () => {
    const { container } = render(<Textarea name="foo" />);
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('renders a label', () => {
    const { container } = render(<Textarea label="foo" name="bar" />);
    expect(container).toHaveTextContent('foo');
  });

  it('can be hidden', () => {
    const { container } = render(<Textarea name="foo" hidden />);
    expect(container.querySelector('textarea[hidden]')).toBeInTheDocument();
  });
});

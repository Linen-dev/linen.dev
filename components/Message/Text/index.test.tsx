import React from 'react';
import { render } from '@testing-library/react';
import Text from '.';

describe('Text', () => {
  it('renders h1 headers', () => {
    const { container } = render(<Text value="# foo" />);
    const node = container.querySelector('h1');
    expect(node).toHaveTextContent('foo');
  });

  it('renders h2 headers', () => {
    const { container } = render(<Text value="## foo" />);
    const node = container.querySelector('h2');
    expect(node).toHaveTextContent('foo');
  });

  it('renders h3 headers', () => {
    const { container } = render(<Text value="### foo" />);
    const node = container.querySelector('h3');
    expect(node).toHaveTextContent('foo');
  });

  it('renders h4 headers', () => {
    const { container } = render(<Text value="#### foo" />);
    const node = container.querySelector('h4');
    expect(node).toHaveTextContent('foo');
  });

  it('renders h5 headers', () => {
    const { container } = render(<Text value="##### foo" />);
    const node = container.querySelector('h5');
    expect(node).toHaveTextContent('foo');
  });

  it('renders h6 headers', () => {
    const { container } = render(<Text value="###### foo" />);
    const node = container.querySelector('h6');
    expect(node).toHaveTextContent('foo');
  });

  it('renders blockquotes', () => {
    const { container } = render(<Text value="> foo" />);
    const node = container.querySelector('blockquote');
    expect(node).toHaveTextContent('foo');
  });

  it('renders emojis', () => {
    const { container } = render(<Text value="Hey :)" />);
    expect(container).toHaveTextContent('😃');
  });
});

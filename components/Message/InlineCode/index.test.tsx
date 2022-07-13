import React from 'react';
import { render } from '@testing-library/react';
import InlineCode from '.';

describe('InlineCode', () => {
  it('renders it', () => {
    const { getByText } = render(<InlineCode value="foo" />);
    const node = getByText('foo');
    expect(node).toHaveTextContent('foo');
    expect(node.nodeName).toEqual('CODE');
  });

  it('normalizes code', () => {
    const { getByText } = render(
      <InlineCode value="&lt;div&gt;foo&lt;/div&gt;" />
    );
    const node = getByText('<div>foo</div>');
    expect(node).toHaveTextContent('<div>foo</div>');
  });

  it('trims code', () => {
    const { getByText } = render(<InlineCode value=" foo " />);
    const node = getByText('foo');
    expect(node.innerHTML).toEqual('foo');
  });
});

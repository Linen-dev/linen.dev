import React from 'react';
import { render } from '@testing-library/react';
import BlockCode from '.';

describe('BlockCode', () => {
  it('renders it', () => {
    const { getByText } = render(<BlockCode value="foo" />);
    const node = getByText('foo');
    expect(node).toHaveTextContent('foo');
    expect(node.nodeName).toEqual('CODE');
  });

  it('normalizes code', () => {
    const { getByText } = render(
      <BlockCode value="&lt;div&gt;foo&lt;/div&gt;" />
    );
    const node = getByText('<div>foo</div>');
    expect(node).toHaveTextContent('<div>foo</div>');
  });

  it('trims code', () => {
    const { getByText } = render(<BlockCode value=" foo " />);
    const node = getByText('foo');
    expect(node.innerHTML).toEqual('foo');
  });
});

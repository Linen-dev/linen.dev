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
});

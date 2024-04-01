import React from 'react';
import { render } from '@testing-library/react';
import Text from '.';

describe('Text', () => {
  it('escapes html entities', () => {
    const { container } = render(<Text value="# &lt;foo&gt;" />);
    expect(container).toHaveTextContent('<foo>');
  });
});

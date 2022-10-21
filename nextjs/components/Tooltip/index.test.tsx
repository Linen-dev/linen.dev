import React from 'react';
import Tooltip from '.';
import { render } from '@testing-library/react';

describe('Tooltip', () => {
  it('renders children', () => {
    const { container } = render(<Tooltip text="foo">bar</Tooltip>);
    expect(container).toHaveTextContent('bar');
  });
});

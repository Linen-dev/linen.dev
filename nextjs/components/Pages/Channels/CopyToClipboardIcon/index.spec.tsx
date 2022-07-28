import React from 'react';
import CopyToClipboardIcon from '.';
import { render } from '@testing-library/react';

describe('CopyToClipboardIcon', () => {
  it('renders a clip icon', () => {
    const props = {
      isSubDomainRouting: false,
      communityName: 'test',
      communityType: 'test',
      path: 'test',
    };
    const { container } = render(<CopyToClipboardIcon {...props} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

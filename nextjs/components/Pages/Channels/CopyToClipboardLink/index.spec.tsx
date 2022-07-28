import React from 'react';
import CopyToClipboardLink from '.';
import { render } from '@testing-library/react';

describe('CopyToClipboardLink', () => {
  it('renders a clip icon', () => {
    const props = {
      isSubDomainRouting: false,
      communityName: 'test',
      communityType: 'test',
      path: 'test',
    };
    const { container } = render(<CopyToClipboardLink {...props} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

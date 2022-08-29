import React from 'react';
import CommunityVisibilityCard from './CommunityVisibilityCard';
import { render } from '@testing-library/react';

describe('CommunityVisibilityCard', () => {
  it('renders a card', () => {
    const { container } = render(<CommunityVisibilityCard />);
    expect(container).toHaveTextContent('Community visibility');
  });
});

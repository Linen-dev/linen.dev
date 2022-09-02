import CommunityVisibilityCard from '.';
import { render } from '@testing-library/react';
import { create } from '__tests__/factory';
import { AccountType } from 'serializers/account';

describe('CommunityVisibilityCard', () => {
  it('renders a description for a public account', () => {
    const account = create('account', { type: AccountType.PUBLIC });
    const { container } = render(<CommunityVisibilityCard account={account} />);
    expect(container).toHaveTextContent(
      'Your community is currently public. It can be viewed by anyone.'
    );
  });

  it('renders a description for a private account', () => {
    const account = create('account', { type: AccountType.PRIVATE });
    const { container } = render(<CommunityVisibilityCard account={account} />);
    expect(container).toHaveTextContent(
      'Your community is currently private. It can be viewed by admins.'
    );
  });
});

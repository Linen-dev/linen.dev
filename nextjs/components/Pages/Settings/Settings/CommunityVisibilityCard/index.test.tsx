import CommunityVisibilityCard from '.';
import { render, waitFor } from '@testing-library/react';
import { create } from '__tests__/factory';
import { AccountType } from '@prisma/client';
import userEvent from '@testing-library/user-event';

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

  it('changes community type on selection', async () => {
    const account = create('account', { type: AccountType.PUBLIC });
    const { container } = render(<CommunityVisibilityCard account={account} />);
    expect(container).toHaveTextContent(
      'Your community is currently public. It can be viewed by anyone.'
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    userEvent.selectOptions(select, [AccountType.PRIVATE]);
    await waitFor(() =>
      expect(container).toHaveTextContent(
        'Your community is currently private. It can be viewed by admins.'
      )
    );
  });
});

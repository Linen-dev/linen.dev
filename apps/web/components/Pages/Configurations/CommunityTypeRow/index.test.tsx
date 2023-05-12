import CommunityTypeCard from '.';
import { render, waitFor } from '@testing-library/react';
import { AccountType } from '@linen/types';
import userEvent from '@testing-library/user-event';

describe('CommunityTypeCard', () => {
  it('renders a description for a public account', () => {
    const { container } = render(
      <CommunityTypeCard
        type={AccountType.PUBLIC}
        onChange={jest.fn()}
        disabled={false}
      />
    );
    expect(container).toHaveTextContent(
      'Your community is currently public. It can be viewed by anyone.'
    );
  });

  it('renders a description for a private account', () => {
    const { container } = render(
      <CommunityTypeCard
        type={AccountType.PRIVATE}
        onChange={jest.fn()}
        disabled={false}
      />
    );
    expect(container).toHaveTextContent(
      'Your community is currently private. It can be viewed by members.'
    );
  });

  it('changes community type on selection', async () => {
    const onChange = jest.fn();
    const { container } = render(
      <CommunityTypeCard
        type={AccountType.PUBLIC}
        onChange={onChange}
        disabled={false}
      />
    );
    expect(container).toHaveTextContent(
      'Your community is currently public. It can be viewed by anyone.'
    );
    const select = container.querySelector('select') as HTMLSelectElement;
    userEvent.selectOptions(select, [AccountType.PRIVATE]);
    await waitFor(() =>
      expect(container).toHaveTextContent(
        'Your community is currently private. It can be viewed by members.'
      )
    );
    expect(onChange).toHaveBeenCalledWith(AccountType.PRIVATE);
  });
});

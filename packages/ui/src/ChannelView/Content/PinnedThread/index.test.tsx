import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinnedThread from '.';

describe('PinnedThread', () => {
  it('renders the content of the first message', () => {
    const onClick = jest.fn();
    const { container } = render(
      <PinnedThread onClick={onClick}>foo https://bar.com</PinnedThread>
    );
    expect(container).toHaveTextContent('foo https://bar.com');
  });

  it('calls onClick thread is clicked', async () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <PinnedThread onClick={onClick}>foo</PinnedThread>
    );
    const node = getByText('foo');
    await userEvent.click(node);
    expect(onClick).toHaveBeenCalled();
  });
});

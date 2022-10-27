import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinnedThread from '.';
import { create } from '__tests__/factory';

describe('PinnedThread', () => {
  it('renders the content of the first message', () => {
    const message = create('message', { body: 'foo https://bar.com' });
    const thread = create('thread', {
      messages: [message],
    });
    const onClick = jest.fn();
    const { container } = render(
      <PinnedThread thread={thread} onClick={onClick} />
    );
    expect(container).toHaveTextContent('foo https://bar.com');
  });

  it('calls onClick thread is clicked', async () => {
    const message = create('message', { body: 'foo' });
    const thread = create('thread', {
      messages: [message],
    });
    const onClick = jest.fn();
    const { getByText } = render(
      <PinnedThread thread={thread} onClick={onClick} />
    );
    const node = getByText('foo');
    await userEvent.click(node);
    expect(onClick).toHaveBeenCalled();
  });
});

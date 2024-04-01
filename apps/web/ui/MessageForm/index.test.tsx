import React from 'react';
import { render } from '@testing-library/react';
import MessageForm from '.';

describe('MessageForm', () => {
  it('renders a textarea', () => {
    const { getByPlaceholderText } = render(
      <MessageForm
        progress={0}
        uploads={[]}
        useUsersContext={() => [[], () => {}]}
        fetchMentions={(args) => Promise.resolve([])}
      />
    );
    const textarea = getByPlaceholderText('Message...');
    expect(textarea).toBeInTheDocument();
  });
});

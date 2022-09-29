import React from 'react';
import { render } from '@testing-library/react';
import Suggestion from '.';
import { create } from '__tests__/factory';

describe('Suggestion', () => {
  it('renders a suggestion', () => {
    const message = create('message');
    const { container } = render(
      <Suggestion
        message={message}
        body="Lorem ipsum"
        mentions={[]}
        communityType="slack"
      />
    );
    expect(container).toHaveTextContent('Lorem ipsum');
  });

  describe('when user is unknown', () => {
    it('renders "user" as the display name', () => {
      const message = create('message');
      const { container } = render(
        <Suggestion
          message={message}
          body="Lorem ipsum"
          mentions={[]}
          communityType="slack"
        />
      );
      expect(container).toHaveTextContent('user');
    });
  });
});

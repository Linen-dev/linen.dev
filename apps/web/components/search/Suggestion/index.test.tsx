import React from 'react';
import { render } from '@testing-library/react';
import Suggestion from '.';
import { MessageFormat } from '@linen/types';

describe('Suggestion', () => {
  it('renders a suggestion', () => {
    const { container } = render(
      <Suggestion
        body="Lorem ipsum"
        mentions={[]}
        format={MessageFormat.LINEN}
      />
    );
    expect(container).toHaveTextContent('Lorem ipsum');
  });

  describe('when user is unknown', () => {
    it('renders "user" as the display name', () => {
      const { container } = render(
        <Suggestion
          body="Lorem ipsum"
          mentions={[]}
          format={MessageFormat.LINEN}
        />
      );
      expect(container).toHaveTextContent('user');
    });
  });
});

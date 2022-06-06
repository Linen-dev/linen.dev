import React from 'react';
import { render } from '@testing-library/react';
import Toggle from 'components/Toggle';

describe('Toggle', () => {
  it('display content', () => {
    const { getByText } = render(
      <Toggle header="header">
        <p>content</p>
      </Toggle>
    );
    expect(getByText('header')).toBeInTheDocument();
    expect(getByText('content')).toBeInTheDocument();
  });

  describe('when arrow is clicked', () => {
    it('toggles the content', () => {
      const { getByText, queryByText } = render(
        <Toggle header="header">
          <p>content</p>
        </Toggle>
      );
      getByText('▾').click();
      expect(getByText('header')).toBeInTheDocument();
      expect(queryByText('content')).not.toBeInTheDocument();
      getByText('▸').click();
      expect(getByText('content')).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render } from '@testing-library/react';
import Accordion from '.';

describe('Accordion', () => {
  it('displays content', () => {
    const { getByText } = render(
      <Accordion header="header">
        <p>content</p>
      </Accordion>
    );
    expect(getByText('header')).toBeInTheDocument();
    expect(getByText('content')).toBeInTheDocument();
  });

  describe('when arrow is clicked', () => {
    it('toggles the content', () => {
      const { getByText, queryByText } = render(
        <Accordion header="header">
          <p>content</p>
        </Accordion>
      );
      getByText('▾').click();
      expect(getByText('header')).toBeInTheDocument();
      expect(queryByText('content')).not.toBeInTheDocument();
      getByText('▸').click();
      expect(getByText('content')).toBeInTheDocument();
    });
  });
});

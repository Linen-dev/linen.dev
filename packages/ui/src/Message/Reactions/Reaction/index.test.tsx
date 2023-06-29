import React from 'react';
import { render } from '@testing-library/react';
import Reaction from '.';

describe('Reaction', () => {
  it('renders the emoji', () => {
    const { container } = render(<Reaction type=":+1:" count={13} />);
    expect(container).toHaveTextContent('👍');
  });

  it('renders the count', () => {
    const { container } = render(<Reaction type=":-1:" count={13} />);
    expect(container).toHaveTextContent('13');
  });

  it('renders aliases', () => {
    const { container } = render(<Reaction type="rock" count={13} />);
    expect(container).toHaveTextContent('🪨');
  });

  describe('when text does not start and end with a : character', () => {
    it('renders the emoji', () => {
      const { container } = render(<Reaction type="+1" count={13} />);
      expect(container).toHaveTextContent('👍');
    });
  });

  describe.skip('when emoji is unsupported', () => {
    it('renders the text', () => {
      const { container } = render(
        <Reaction type="people_hugging" count={13} />
      );
      expect(container).toHaveTextContent('people_hugging');
    });
  });
});

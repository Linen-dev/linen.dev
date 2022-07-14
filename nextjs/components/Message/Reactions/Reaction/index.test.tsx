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

  describe('when text does not start and end with a : character', () => {
    it('renders the emoji', () => {
      const { container } = render(<Reaction type="+1" count={13} />);
      expect(container).toHaveTextContent('👍');
    });
  });
});

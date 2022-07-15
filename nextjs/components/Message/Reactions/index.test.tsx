import React from 'react';
import { render } from '@testing-library/react';
import Reactions from '.';

describe('Reaction', () => {
  it('renders emojis', () => {
    const reactions = [
      { type: ':+1:', count: 13 },
      { type: ':-1:', count: 12 },
    ];
    const { container } = render(<Reactions reactions={reactions} />);
    expect(container).toHaveTextContent('👍');
    expect(container).toHaveTextContent(' ');
  });

  it('renders counts', () => {
    const reactions = [
      { type: ':+1:', count: 13 },
      { type: ':-1:', count: 12 },
    ];
    const { container } = render(<Reactions reactions={reactions} />);
    expect(container).toHaveTextContent('13');
    expect(container).toHaveTextContent('12');
  });

  describe('when there are no reactions', () => {
    it('does not render anything', () => {
      const { container } = render(<Reactions />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when reactions array is empty', () => {
    it('does not render anything', () => {
      const { container } = render(<Reactions reactions={[]} />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});

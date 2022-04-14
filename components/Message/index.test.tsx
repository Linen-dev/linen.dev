import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';

describe('Message', () => {
  describe('when user name is unknown', () => {
    it('display a message with unknown user name', () => {
      const { container } = render(<Message text="Hey <@A1>, how are you?" />);
      expect(container).toHaveTextContent('@User');
    });
  });
});

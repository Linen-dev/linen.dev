import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';

describe('Message', () => {
  it('renders emojis', () => {
    const { container } = render(<Message text="Hey :)" />);
    expect(container).toHaveTextContent('😃');
  });

  it('highlights channel names', () => {
    const { container } = render(<Message text="Hey <!general>" />);
    expect(container).toHaveTextContent('@general');
  });

  it('renders channel names', () => {
    const { container } = render(<Message text="Hey <#A1|general>" />);
    expect(container).toHaveTextContent('#general');
  });

  it('renders links', () => {
    const { getByText } = render(<Message text="Hey <https://foo.com>" />);
    const link = getByText('https://foo.com') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
  });

  describe('when link has an optional text', () => {
    it('renders a custom link text', () => {
      const { getByText } = render(
        <Message text="Hey <https://foo.com|bar>" />
      );
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });
  });

  describe('when user name is unknown', () => {
    it('display a message with unknown user name', () => {
      const { container } = render(<Message text="Hey <@A1>, how are you?" />);
      expect(container).toHaveTextContent('@User');
    });
  });
});

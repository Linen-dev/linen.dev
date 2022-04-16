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

  describe('when a mention is present', () => {
    describe("and mention data is present", () => {
      it('renders mention names', () => {
        const { container } = render(
          <Message text="Hey <@A1>" mentions={[{ id: "A1", displayName: "John Doe", slackUserId: '1234', profileImageUrl: 'https://img.com/1234', isBot: false, isAdmin: false,  accountsId: '1234' }]} />
        );
        expect(container).toHaveTextContent('@John Doe');
      });
    })

    describe('and there is no mention data', () => {
      it('renders "@User"', () => {
        const { container } = render(<Message text="Hey <@A1>, how are you?" />);
        expect(container).toHaveTextContent('@User');
      });
    })
  });

  describe('when a link is present', () => {
    it('renders it', () => {
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
  });
});

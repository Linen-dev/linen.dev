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

  describe('when channel data is present', () => {
    it('renders channel names', () => {
      const { container } = render(<Message text="Hey <#A1>" />);
      expect(container).toHaveTextContent('#A1');
    });

    describe('when name is present', () => {
      it('renders channel names', () => {
        const { container } = render(<Message text="Hey <#A1|general>" />);
        expect(container).toHaveTextContent('#general');
      });
    });
  });

  describe('when a mention is present', () => {
    describe('and mention data is present', () => {
      it('renders mention names', () => {
        const { container } = render(
          <Message
            text="Hey <@1234>"
            mentions={[
              {
                id: 'A1',
                displayName: 'John Doe',
                externalUserId: '1234',
                profileImageUrl: 'https://img.com/1234',
                isBot: false,
                isAdmin: false,
                accountsId: '1234',
              },
            ]}
          />
        );
        expect(container).toHaveTextContent('@John Doe');
      });

      describe('and no mention matches', () => {
        it('renders "@User"', () => {
          const { container } = render(
            <Message
              text="Hey <@A1>"
              mentions={[
                {
                  id: 'A2',
                  displayName: 'John Doe',
                  externalUserId: '1234',
                  profileImageUrl: 'https://img.com/1234',
                  isBot: false,
                  isAdmin: false,
                  accountsId: '1234',
                },
              ]}
            />
          );
          expect(container).toHaveTextContent('@User');
        });
      });

      describe('and mention is broken', () => {
        it('does not render anything', () => {
          const { container } = render(<Message text="Hey <@>." />);
          expect(container).toHaveTextContent('Hey .');
        });
      });
    });

    describe('and there is no mention data', () => {
      it('renders "@User"', () => {
        const { container } = render(
          <Message text="Hey <@A1>, how are you?" />
        );
        expect(container).toHaveTextContent('@User');
      });
    });
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

  describe('when a mail is present', () => {
    it('renders it', () => {
      const { getByText } = render(<Message text="Hey <mailto:linen.dev>" />);
      const link = getByText('linen.dev') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:linen.dev');
    });

    describe('when mail has an optional text', () => {
      it('renders a custom link text', () => {
        const { getByText } = render(
          <Message text="Hey <mailto:linen.dev|Linen Support>" />
        );
        const link = getByText('Linen Support') as HTMLLinkElement;
        expect(link.href).toEqual('mailto:linen.dev');
      });
    });
  });

  describe('when inline code is present', () => {
    it('renders it', () => {
      const { getByText } = render(<Message text="Hey `foo`" />);
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });
  });

  describe('when block code is present', () => {
    it('renders it', () => {
      const { getByText } = render(<Message text="Hey ```foo```" />);
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });
  });
});

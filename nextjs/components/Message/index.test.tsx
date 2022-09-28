import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';

describe('Message', () => {
  describe('linen format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format="linen" />
      );
      expect(container).toHaveTextContent('Hello World');
    });
  });

  describe('slack format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format="slack" />
      );
      expect(container).toHaveTextContent('Hello World');
    });

    it('renders emojis', () => {
      const { container } = render(<Message text="Hey :)" format="slack" />);
      expect(container).toHaveTextContent('😃');
    });

    it('renders channel ids', () => {
      const { container } = render(<Message text="Hey <#A1>" format="slack" />);
      expect(container).toHaveTextContent('#A1');
    });

    it('renders channel names', () => {
      const { container } = render(
        <Message text="Hey <#A1|general>" format="slack" />
      );
      expect(container).toHaveTextContent('#general');
    });

    it('renders commands', () => {
      const { container } = render(
        <Message text="Hey <!fx^fy>" format="slack" />
      );
      expect(container).toHaveTextContent('<!fx^fy>');
    });

    it('renders usernames', () => {
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
              anonymousAlias: '',
              authsId: null,
              role: 'ADMIN',
            },
          ]}
          format="slack"
        />
      );
      expect(container).toHaveTextContent('@John Doe');
    });

    it('renders `@User` for a mention without data', () => {
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
              anonymousAlias: '',
              authsId: null,
              role: 'ADMIN',
            },
          ]}
          format="slack"
        />
      );
      expect(container).toHaveTextContent('@User');
    });

    it('renders `@User` for a broken mention', () => {
      const { container } = render(<Message text="Hey <@>." format="slack" />);
      expect(container).toHaveTextContent('Hey @User.');
    });

    it('renders "@User" when there is no mention data', () => {
      const { container } = render(
        <Message text="Hey <@A1>, how are you?" format="slack" />
      );
      expect(container).toHaveTextContent('@User');
    });

    it('renders links', () => {
      const { getByText } = render(
        <Message text="Hey <https://foo.com>" format="slack" />
      );
      const link = getByText('https://foo.com') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders links with labels', () => {
      const { getByText } = render(
        <Message text="Hey <https://foo.com|bar>" format="slack" />
      );
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders emails', () => {
      const { getByText } = render(
        <Message text="Hey <mailto:help@linen.dev>" format="slack" />
      );
      const link = getByText('help@linen.dev') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it('renders emails with labels', () => {
      const { getByText } = render(
        <Message
          text="Hey <mailto:help@linen.dev|Linen Support>"
          format="slack"
        />
      );
      const link = getByText('Linen Support') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it('renders inline code', () => {
      const { getByText } = render(<Message text="Hey `foo`" format="slack" />);
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code', () => {
      const { getByText } = render(
        <Message text="Hey ```foo```" format="slack" />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });
  });

  describe('discord format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format="discord" />
      );
      expect(container).toHaveTextContent('Hello World');
    });

    it('renders links', () => {
      const { getByText } = render(
        <Message text="Hey https://foo.com" format="discord" />
      );
      const link = getByText('https://foo.com') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders emails', () => {
      const { getByText } = render(
        <Message text="Hey mailto:help@linen.dev" format="discord" />
      );
      const link = getByText('help@linen.dev') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it('renders emojis', () => {
      const { container } = render(<Message text="Hey :)" format="discord" />);
      expect(container).toHaveTextContent('😃');
    });

    it('renders channel ids', () => {
      const { container } = render(
        <Message text="Hey <#A1>" format="discord" />
      );
      expect(container).toHaveTextContent('#A1');
    });

    it('renders inline code', () => {
      const { getByText } = render(
        <Message text="Hey `foo`" format="discord" />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code', () => {
      const { getByText } = render(
        <Message text="Hey ```foo```" format="discord" />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code without changing links', () => {
      const { getByText } = render(
        <Message text="Hey ```https://foo.com```" format="discord" />
      );
      const node = getByText('https://foo.com');
      expect(node).toHaveTextContent('https://foo.com');
      expect(node.nodeName).toEqual('CODE');
    });
  });
});

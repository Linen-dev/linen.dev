import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';
import { MessageFormat } from '@linen/types';

describe('Message', () => {
  describe('linen format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format={MessageFormat.LINEN} />
      );
      expect(container).toHaveTextContent('Hello World');
    });
  });

  describe('slack format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('Hello World');
    });

    it.skip('renders emojis', () => {
      const { container } = render(
        <Message text="Hey :)" format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('😃');
    });

    it('renders channel ids', () => {
      const { container } = render(
        <Message text="Hey <#A1>" format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('#A1');
    });

    it('renders channel names', () => {
      const { container } = render(
        <Message text="Hey <#A1|general>" format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('#general');
    });

    it('renders commands', () => {
      const { container } = render(
        <Message text="Hey <!fx^fy>" format={MessageFormat.SLACK} />
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
              username: 'john.doe',
              authsId: null,
            },
          ]}
          format={MessageFormat.SLACK}
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
              username: 'john.doe',
              authsId: null,
            },
          ]}
          format={MessageFormat.SLACK}
        />
      );
      expect(container).toHaveTextContent('@User');
    });

    it('renders `@User` for a broken mention', () => {
      const { container } = render(
        <Message text="Hey <@>." format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('Hey @User.');
    });

    it('renders "@User" when there is no mention data', () => {
      const { container } = render(
        <Message text="Hey <@A1>, how are you?" format={MessageFormat.SLACK} />
      );
      expect(container).toHaveTextContent('@User');
    });

    it('renders https links', () => {
      const { getByText } = render(
        <Message text="Hey <https://foo.com>" format={MessageFormat.SLACK} />
      );
      const link = getByText('https://foo.com') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders http links', () => {
      const { getByText } = render(
        <Message text="Hey <http://foo.com>" format={MessageFormat.SLACK} />
      );
      const link = getByText('http://foo.com') as HTMLLinkElement;
      expect(link.href).toEqual('http://foo.com/');
    });

    it('renders links with labels', () => {
      const { getByText } = render(
        <Message
          text="Hey <https://foo.com|bar>"
          format={MessageFormat.SLACK}
        />
      );
      const link = getByText('bar') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders emails', () => {
      const { getByText } = render(
        <Message
          text="Hey <mailto:help@linen.dev>"
          format={MessageFormat.SLACK}
        />
      );
      const link = getByText('help@linen.dev') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it('renders emails with labels', () => {
      const { getByText } = render(
        <Message
          text="Hey <mailto:help@linen.dev|Linen Support>"
          format={MessageFormat.SLACK}
        />
      );
      const link = getByText('Linen Support') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it('renders inline code', () => {
      const { getByText } = render(
        <Message text="Hey `foo`" format={MessageFormat.SLACK} />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code', () => {
      const { getByText } = render(
        <Message text="Hey ```foo```" format={MessageFormat.SLACK} />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });
  });

  describe('discord format', () => {
    it('renders text', () => {
      const { container } = render(
        <Message text="Hello World" format={MessageFormat.DISCORD} />
      );
      expect(container).toHaveTextContent('Hello World');
    });

    it('renders links', () => {
      const { getByText } = render(
        <Message text="Hey https://foo.com" format={MessageFormat.DISCORD} />
      );
      const link = getByText('https://foo.com') as HTMLLinkElement;
      expect(link.href).toEqual('https://foo.com/');
    });

    it('renders emails', () => {
      const { getByText } = render(
        <Message
          text="Hey mailto:help@linen.dev"
          format={MessageFormat.DISCORD}
        />
      );
      const link = getByText('help@linen.dev') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:help@linen.dev');
    });

    it.skip('renders emojis', () => {
      const { container } = render(
        <Message text="Hey :)" format={MessageFormat.DISCORD} />
      );
      expect(container).toHaveTextContent('😃');
    });

    it('renders channel ids', () => {
      const { container } = render(
        <Message text="Hey <#A1>" format={MessageFormat.DISCORD} />
      );
      expect(container).toHaveTextContent('#A1');
    });

    it('renders inline code', () => {
      const { getByText } = render(
        <Message text="Hey `foo`" format={MessageFormat.DISCORD} />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code', () => {
      const { getByText } = render(
        <Message text="Hey ```foo```" format={MessageFormat.DISCORD} />
      );
      const node = getByText('foo');
      expect(node).toHaveTextContent('foo');
      expect(node.nodeName).toEqual('CODE');
    });

    it('renders block code without changing links', () => {
      const { getByText } = render(
        <Message
          text="Hey ```https://foo.com```"
          format={MessageFormat.DISCORD}
        />
      );
      const node = getByText('https://foo.com');
      expect(node).toHaveTextContent('https://foo.com');
      expect(node.nodeName).toEqual('CODE');
    });
  });
});

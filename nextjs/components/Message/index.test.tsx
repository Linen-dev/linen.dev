import React from 'react';
import { render } from '@testing-library/react';
import Message from '.';

describe('Message', () => {
  it('renders text', () => {
    const { container } = render(<Message text="Hello World" />);
    expect(container).toHaveTextContent('Hello World');
  });

  it('renders emojis', () => {
    const { container } = render(<Message text="Hey :)" />);
    expect(container).toHaveTextContent('😃');
  });

  it('renders channel ids', () => {
    const { container } = render(<Message text="Hey <#A1>" />);
    expect(container).toHaveTextContent('#A1');
  });

  it('renders channel names', () => {
    const { container } = render(<Message text="Hey <#A1|general>" />);
    expect(container).toHaveTextContent('#general');
  });

  it('renders commands', () => {
    const { container } = render(<Message text="Hey <!fx^fy>" />);
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
          },
        ]}
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
          },
        ]}
      />
    );
    expect(container).toHaveTextContent('@User');
  });

  it('renders `@User` for a broken mention', () => {
    const { container } = render(<Message text="Hey <@>." />);
    expect(container).toHaveTextContent('Hey @User.');
  });

  it('renders "@User" when there is no mention data', () => {
    const { container } = render(<Message text="Hey <@A1>, how are you?" />);
    expect(container).toHaveTextContent('@User');
  });

  it('renders links', () => {
    const { getByText } = render(<Message text="Hey <https://foo.com>" />);
    const link = getByText('https://foo.com') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
  });

  it('renders links with labels', () => {
    const { getByText } = render(<Message text="Hey <https://foo.com|bar>" />);
    const link = getByText('bar') as HTMLLinkElement;
    expect(link.href).toEqual('https://foo.com/');
  });

  it('renders emails', () => {
    const { getByText } = render(
      <Message text="Hey <mailto:help@linen.dev>" />
    );
    const link = getByText('help@linen.dev') as HTMLLinkElement;
    expect(link.href).toEqual('mailto:help@linen.dev');
  });

  it('renders emails with labels', () => {
    const { getByText } = render(
      <Message text="Hey <mailto:help@linen.dev|Linen Support>" />
    );
    const link = getByText('Linen Support') as HTMLLinkElement;
    expect(link.href).toEqual('mailto:help@linen.dev');
  });

  it('renders inline code', () => {
    const { getByText } = render(<Message text="Hey `foo`" />);
    const node = getByText('foo');
    expect(node).toHaveTextContent('foo');
    expect(node.nodeName).toEqual('CODE');
  });

  it('renders block code', () => {
    const { getByText } = render(<Message text="Hey ```foo```" />);
    const node = getByText('foo');
    expect(node).toHaveTextContent('foo');
    expect(node.nodeName).toEqual('CODE');
  });

  describe('when using a discord format', () => {
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

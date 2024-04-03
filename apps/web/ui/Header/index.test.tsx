import Header from '.';
import { render } from '@testing-library/react';
import { build } from '@linen/factory-client';

jest.mock('@linen/auth-client/client', () => ({
  useSession: () => ({}),
}));

const Link = ({ children, ...props }: any) => (
  <a {...{ ...props }}>{children}</a>
);

describe('Header', () => {
  describe('when the user is a member', () => {
    it.skip('renders the user avatar', () => {
      const settings = build('settings');
      const user = build('user');
      const permissions = build('permissions', { is_member: true, user });
      const currentCommunity = build('account');
      const { container } = render(
        <Header
          settings={settings}
          channels={[]}
          currentCommunity={currentCommunity}
          permissions={permissions}
          api={{} as any}
          InternalLink={Link}
          JoinButton={() => <div>JoinButton</div>}
          Link={Link}
          routerAsPath=""
          signOut={jest.fn()}
          usePath={jest.fn()}
          handleSelect={jest.fn()}
          isSubDomainRouting={false}
        />
      );
      expect(container).toHaveTextContent('Open user menu');
      expect(container).not.toHaveTextContent('Join the conversation');
    });
  });
  describe('when the user is not a member', () => {
    it('renders the join button', () => {
      const settings = build('settings');
      const user = build('user');
      const permissions = build('permissions', { is_member: false, user });
      const currentCommunity = build('account');
      const { container } = render(
        <Header
          settings={settings}
          channels={[]}
          currentCommunity={currentCommunity}
          permissions={permissions}
          api={{} as any}
          InternalLink={Link}
          JoinButton={() => <div>JoinButton</div>}
          Link={Link}
          routerAsPath=""
          signOut={jest.fn()}
          usePath={jest.fn()}
          handleSelect={jest.fn()}
          isSubDomainRouting={false}
        />
      );
      // expect(container).toHaveTextContent('Sign InSign Up');
      expect(container).not.toHaveTextContent('Open user menu');
    });
  });
});

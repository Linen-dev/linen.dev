import React from 'react';
import Header from '.';
import { render } from '@testing-library/react';
import { build } from '@linen/factory';
import { Mode } from '@linen/hooks/mode';

jest.mock('utilities/auth/react', () => ({
  useSession: () => ({}),
}));

describe('Header', () => {
  describe('when the user is a member', () => {
    it('renders the user avatar', () => {
      const settings = build('settings');
      const user = build('user');
      const permissions = build('permissions', { is_member: true, user });
      const currentCommunity = build('account');
      const { container } = render(
        <Header
          settings={settings}
          channels={[]}
          currentCommunity={currentCommunity}
          isSubDomainRouting={false}
          permissions={permissions}
          onProfileChange={jest.fn()}
          onUpload={jest.fn()}
          mode={Mode.Default}
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
          isSubDomainRouting={false}
          permissions={permissions}
          onProfileChange={jest.fn()}
          onUpload={jest.fn()}
          mode={Mode.Default}
        />
      );
      expect(container).toHaveTextContent('Join Community');
      expect(container).not.toHaveTextContent('Open user menu');
    });
  });
});

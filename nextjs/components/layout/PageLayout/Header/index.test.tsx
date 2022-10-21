import React from 'react';
import Header from '.';
import { render } from '@testing-library/react';
import { create } from '__tests__/factory';

jest.mock('next-auth/react', () => ({
  useSession: () => ({}),
}));

describe('Header', () => {
  describe('when the user is a member', () => {
    it('renders the user avatar', () => {
      const settings = create('settings');
      const user = create('user');
      const permissions = create('permissions', { is_member: true, user });
      const { container } = render(
        <Header
          settings={settings}
          channels={[]}
          isSubDomainRouting={false}
          permissions={permissions}
          onProfileChange={jest.fn()}
        />
      );
      expect(container).toHaveTextContent('Open user menu');
      expect(container).not.toHaveTextContent('Join the conversation');
    });
  });
  describe('when the user is not a member', () => {
    it('renders the join button', () => {
      const settings = create('settings');
      const user = create('user');
      const permissions = create('permissions', { is_member: false, user });
      const { container } = render(
        <Header
          settings={settings}
          channels={[]}
          isSubDomainRouting={false}
          permissions={permissions}
          onProfileChange={jest.fn()}
        />
      );
      expect(container).toHaveTextContent('Join the conversation');
      expect(container).not.toHaveTextContent('Open user menu');
    });
  });
});

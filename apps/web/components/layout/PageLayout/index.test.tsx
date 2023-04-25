import React from 'react';
import { render } from '@testing-library/react';
import PageLayout from '.';
import { build } from '@linen/factory';
import { SessionProvider } from '@linen/auth/client';

describe('PageLayout', () => {
  it('renders the home url', () => {
    const channels = [build('channel')];
    const settings = build('settings', {
      homeUrl: 'https://foo.com',
    });
    const community = build('account');
    const { baseElement } = render(
      <SessionProvider>
        <PageLayout
          settings={settings}
          channels={channels}
          communities={[]}
          currentChannel={channels[0]}
          currentCommunity={community}
          isSubDomainRouting
          permissions={build('permissions')}
        >
          foo
        </PageLayout>
      </SessionProvider>
    );
    expect(baseElement.innerHTML).toContain('https://foo.com');
  });
});

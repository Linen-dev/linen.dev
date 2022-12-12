import React from 'react';
import { render } from '@testing-library/react';
import PageLayout from '.';
import { build } from '__tests__/factory';
import { SessionProvider } from 'utilities/auth/react';

describe('PageLayout', () => {
  it('renders the home url', () => {
    const channels = [build('channel')];
    const settings = build('settings', {
      homeUrl: 'https://foo.com',
    });
    const { baseElement } = render(
      <SessionProvider>
        <PageLayout
          settings={settings}
          channels={channels}
          currentChannel={channels[0]}
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

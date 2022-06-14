import React from 'react';
import { render } from '@testing-library/react';
import LinkCard from '.';

describe('LinkCard', () => {
  describe('when account is not provided', () => {
    it('should not render', () => {
      const { container } = render(<LinkCard />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('when account is provided', () => {
    describe('when account.slackSyncStatus is not DONE', () => {
      it('should not render', () => {
        const { container } = render(
          <LinkCard account={{ slackSyncStatus: 'PENDING' } as any} />
        );
        expect(container).toBeEmptyDOMElement();
      });
    });

    describe('when account.slackSyncStatus is DONE', () => {
      it('should render', () => {
        const { container } = render(
          <LinkCard account={{ slackSyncStatus: 'DONE' } as any} />
        );
        expect(container).not.toBeEmptyDOMElement();
      });
    });
  });
});

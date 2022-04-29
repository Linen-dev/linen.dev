import React from 'react';
import SidebarLink from '.';
import { render } from '@testing-library/react';

describe('SidebarLink', () => {
  describe('when the link is active', () => {
    it('renders as selected', () => {
      const { container } = render(
        <SidebarLink href="/foo" text="bar" active icon={<span>baz</span>} />
      );
      expect(container.querySelector('[aria-selected]')).toBeInTheDocument();
    });
  });

  describe('when the link is not active', () => {
    it('does not render as selected', () => {
      const { container } = render(
        <SidebarLink href="/foo" text="bar" icon={<span>baz</span>} />
      );
      expect(
        container.querySelector('[aria-selected]')
      ).not.toBeInTheDocument();
    });
  });
});

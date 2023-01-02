import React from 'react';
import { render } from '@testing-library/react';
import Mail from '.';

describe('Mail', () => {
  it('renders it', () => {
    const { getByText } = render(<Mail url="mailto:linen.dev"  title="linen.dev" />);
    const link = getByText('linen.dev') as HTMLLinkElement;
    expect(link.href).toEqual('mailto:linen.dev');
    expect(link.target).toEqual('_blank');
  });

  describe('when mail has an optional text', () => {
    it('renders it', () => {
      const { getByText } = render(
        <Mail url="mailto:linen.dev" title="Linen Support" />
      );
      const link = getByText('Linen Support') as HTMLLinkElement;
      expect(link.href).toEqual('mailto:linen.dev');
      expect(link.target).toEqual('_blank');
    });
  });
});

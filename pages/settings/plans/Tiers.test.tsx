import React from 'react';
import { render } from '@testing-library/react';
import Tiers from './Tiers';
import { Period } from './types';

describe('Tiers', () => {
  it('renders tiers', () => {
    const { container } = render(
      <Tiers
        tiers={[
          {
            name: 'Standard',
            href: '#',
            description: 'All the basics for starting',
            features: [
              'Potenti felis, in cras at at ligula nunc.',
              'Orci neque eget pellentesque.',
            ],
          },
          {
            name: 'Premium',
            href: '#',
            priceMonthly: 250,
            priceYearly: 2500,
            description: 'Additional features',
            features: [
              'Potenti felis, in cras at at ligula nunc. ',
              'Orci neque eget pellentesque.',
              'Donec mauris sit in eu tincidunt etiam.',
            ],
          },
        ]}
        activePeriod={Period.Monthly}
      />
    );
    expect(container).toHaveTextContent('Standard');
    expect(container).toHaveTextContent('Premium');
  });
});

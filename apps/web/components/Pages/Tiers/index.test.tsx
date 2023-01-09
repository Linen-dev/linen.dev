import React from 'react';
import { render } from '@testing-library/react';
import Tiers from '.';
import { Period } from 'components/Pages/Plans';
jest.mock('../../../client');

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
            description: 'Additional features',
            features: [
              'Potenti felis, in cras at at ligula nunc. ',
              'Orci neque eget pellentesque.',
              'Donec mauris sit in eu tincidunt etiam.',
            ],
            prices: [
              {
                id: 'price_5678',
                amount: 250,
                type: Period.Monthly,
              },
              {
                id: 'price_5678',
                amount: 2500,
                type: Period.Yearly,
              },
            ],
          },
        ]}
        activePeriod={Period.Monthly}
        account={{ id: '1234', premium: false, syncStatus: 'synced' }}
      />
    );
    expect(container).toHaveTextContent('Standard');
    expect(container).toHaveTextContent('Premium');
  });
});

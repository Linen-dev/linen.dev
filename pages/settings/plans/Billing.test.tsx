import React from 'react';
import Billing from './Billing';
import { render } from '@testing-library/react';
import { Period } from './types';

describe('Billing', () => {
  it('renders plans', () => {
    const onPeriodChange = jest.fn();
    const { container } = render(
      <Billing
        activePeriod={Period.Monthly}
        plans={[
          {
            name: 'Monthly',
            type: Period.Monthly,
          },
          {
            name: 'Yearly',
            type: Period.Yearly,
          },
        ]}
        onPeriodChange={onPeriodChange}
      />
    );

    expect(container).toHaveTextContent('Monthly billing');
    expect(container).toHaveTextContent('Yearly billing');
  });
});

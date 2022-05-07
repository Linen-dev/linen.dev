import React from 'react';
import Billing from 'pages/settings/plans/Billing';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Period } from 'pages/settings/plans/types';

describe('Billing', () => {
  it('renders plans', async () => {
    const onPeriodChange = jest.fn();
    const { container, getByText } = render(
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
    await userEvent.click(getByText('Yearly billing'));
    expect(onPeriodChange).toHaveBeenCalledWith(Period.Yearly);
  });
});

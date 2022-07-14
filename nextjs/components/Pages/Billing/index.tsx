import React from 'react';
import classNames from 'classnames';
import { Period } from 'pages/settings/plans';

interface Plan {
  name: string;
  type: Period;
}

interface Props {
  activePeriod: Period;
  onPeriodChange: (type: Period) => void;
  plans: Plan[];
  premium?: boolean;
}

export default function Billing({
  activePeriod,
  plans,
  onPeriodChange,
}: Props) {
  return (
    <div className="relative self-center mt-6 bg-gray-100 rounded-lg p-0.5 flex sm:mt-8">
      {plans.map((plan) => (
        <button
          key={plan.name}
          type="button"
          className={classNames(
            'relative w-1/2 border-gray-200 rounded-md py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8',
            { 'bg-white shadow-sm': plan.type === activePeriod }
          )}
          onClick={() => onPeriodChange(plan.type)}
        >
          {plan.name} billing
        </button>
      ))}
    </div>
  );
}

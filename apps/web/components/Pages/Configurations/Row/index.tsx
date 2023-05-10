import React from 'react';
import H3 from '@linen/ui/H3';

interface Props {
  header: string;
  description: React.ReactNode;
  action: React.ReactNode;
}

export default function Row({ header, description, action }: Props) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <H3>{header}</H3>
        <div className="mt-2 sm:flex sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500 dark:text-gray-300">
            {description}
          </div>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}

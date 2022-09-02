import React from 'react';

interface Props {
  header: string;
  description: React.ReactNode;
}

export default function Card({ header, description }: Props) {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{header}</h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}

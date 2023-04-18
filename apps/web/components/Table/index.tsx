import React from 'react';

interface Props {
  monospaced?: boolean;
  children: React.ReactNode;
}

export function Thead({ children }: Props) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function Th({ children }: Props) {
  return (
    <th className="p-3 text-left text-sm font-semibold text-gray-900">
      {children}
    </th>
  );
}

export function Td({ children }: Props) {
  return (
    <td className="whitespace-nowrap p-3 text-sm text-gray-900">{children}</td>
  );
}

export function Tbody({ children }: Props) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
  );
}

export default function Table({ monospaced, children }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full py-2 align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
          <table
            className={`min-w-full divide-y divide-gray-300 ${
              monospaced ? 'font-mono' : ''
            }`}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

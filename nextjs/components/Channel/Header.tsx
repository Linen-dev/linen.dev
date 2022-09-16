import React from 'react';
import { AiOutlineLeft, AiOutlineClose } from 'react-icons/ai';

interface Props {
  title: string;
  onClose?(): void;
  closed?: boolean;
}

export default function Header({ title, onClose, closed }: Props) {
  return (
    <div className="border-b border-solid border-gray-200 py-4 px-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row justify-center">
          {onClose && (
            <div className="flex items-center md:hidden">
              <a onClick={onClose}>
                <AiOutlineLeft color="gray" />
              </a>
            </div>
          )}

          <p className="font-bold">{title}</p>
        </div>
        {onClose && (
          <a onClick={onClose} className="hidden md:flex md:justify-center">
            {closed && (
              <span className="px-3 py-1.5 mr-2 text-xs text-blue-900 bg-blue-100 rounded-md">
                Thread Closed
              </span>
            )}
            <div className="min-w-[10px] flex justify-center cursor-pointer items-center">
              <span className="text-slate-400">
                <AiOutlineClose />
              </span>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

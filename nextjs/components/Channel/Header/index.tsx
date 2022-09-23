import React from 'react';
import classNames from 'classnames';
import { AiOutlineLeft, AiOutlineClose } from 'react-icons/ai';
import styles from './index.module.css';

interface Props {
  title?: string | null;
  channelName: string;
  onClose(): void;
  closed?: boolean;
}

export default function Header({ title, channelName, onClose, closed }: Props) {
  return (
    <div
      className={classNames(
        styles.header,
        'border-b border-solid border-gray-200 py-4 px-4'
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-center">
          <div className="flex items-center md:hidden mr-2">
            <a onClick={onClose}>
              <AiOutlineLeft color="gray" />
            </a>
          </div>

          <div>
            <div className="text-lg font-bold block">{title || 'Thread'}</div>
            <div className="text-gray-600 text-xs ">#{channelName}</div>
          </div>
        </div>
        <div className="flex flex-row">
          {closed && (
            <div className="inline-block px-3 py-1.5 mr-2 text-xs text-blue-900 bg-blue-100 rounded-md">
              Thread Closed
            </div>
          )}
          <a onClick={onClose} className="hidden md:flex">
            <div className="min-w-[10px] flex justify-center cursor-pointer items-center">
              <span className="text-slate-400">
                <AiOutlineClose />
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

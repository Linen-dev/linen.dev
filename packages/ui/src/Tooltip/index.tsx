import React, { useState } from 'react';
import Portal from '@/Portal';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'right';
}

function calculateCoords(rect: DOMRect, position: string) {
  if (position === 'right') {
    return {
      left: rect.left + rect.width + 8,
      top: rect.top,
    };
  }
  return {
    left: rect.left + rect.width / 2,
    top: rect.top - rect.height - 8,
  };
}

export default function Tooltip({
  className,
  text,
  position,
  children,
}: Props) {
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [show, toggle] = useState(false);

  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = event.target as HTMLDivElement;
    const rect = node.getBoundingClientRect();
    setCoords(calculateCoords(rect, position as string));
    toggle(true);
  };

  const onMouseLeave = () => {
    toggle(false);
  };
  return (
    <>
      <div
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
      {show && (
        <Portal id="tooltip-portal">
          <div
            style={{ left: coords.left, top: coords.top }}
            className={classNames(styles.tooltip, {
              [styles.top]: position === 'top',
              [styles.right]: position === 'right',
            })}
          >
            {text}
          </div>
        </Portal>
      )}
    </>
  );
}

Tooltip.defaultProps = {
  position: 'top',
};

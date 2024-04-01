import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import classNames from 'classnames';

export const useContextMenu = <T extends any>() => {
  const [clicked, setClicked] = useState(false);
  const [context, setContext] = useState<T>();
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleClick = () => setClicked(false);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return {
    clicked,
    setClicked,
    points,
    setPoints,
    context,
    setContext,
  };
};

export const ContextMenu = <T extends any>({
  top,
  left,
  items,
  context,
}: {
  top: number;
  left: number;
  items: {
    label: string;
    onClick: (context: T) => void;
    icon: JSX.Element;
  }[];
  context?: T;
}) => {
  return (
    <div
      className={classNames(styles.menu, styles.open)}
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    >
      {items.map((item, index) => {
        return (
          <div key={`menu-item-${item.label}-${index}`}>
            <div
              className={styles.action}
              onClick={() => {
                context && item.onClick(context);
              }}
            >
              {item.icon}
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

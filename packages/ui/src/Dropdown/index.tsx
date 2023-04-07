import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

export interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  onClick(): void;
}

interface Props {
  button: React.ReactNode;
  items: DropdownItem[];
}

export default function Example({ button, items }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const onOutsideClick = (event: any) => {
    const node = ref.current as HTMLDivElement | null;
    if (node && !node.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', onOutsideClick, false);
    return () => {
      document.removeEventListener('click', onOutsideClick, false);
    };
  }, []);

  return (
    <div ref={ref} className={styles.dropdown}>
      <div onClick={() => setOpen((open) => !open)}>{button}</div>
      <div className={classNames(styles.menu, { [styles.open]: open })}>
        {items.map((item, index) => {
          return (
            <div key={`menu-item-${item.label}-${index}`}>
              <div className={styles.action} onClick={item.onClick}>
                {item.icon}
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

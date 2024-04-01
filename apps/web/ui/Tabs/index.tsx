import React from 'react';
import Tab from '../Tab';
import styles from './index.module.scss';

interface Item {
  active: boolean;
  id: string;
  header: React.ReactNode;
  onClick(id: string): void;
}

interface Props {
  items: Item[];
}

export default function Tabs({ items }: Props) {
  return (
    <div className={styles.tabs}>
      {items.map((item) => {
        return (
          <Tab
            active={item.active}
            id={item.id}
            key={`tab-${item.id}`}
            header={item.header}
            onClick={item.onClick}
          ></Tab>
        );
      })}
    </div>
  );
}

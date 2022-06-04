import React, { useState } from 'react';
import styles from './index.module.css';

interface Props {
  header: string;
  children: React.ReactNode;
}

export default function Toggle({ header, children }: Props) {
  const [visible, setVisible] = useState(true);

  return (
    <div>
      <p className={styles.text}>
        {header}
        <span
          className={styles.arrow}
          onClick={() => setVisible((visible) => !visible)}
        >
          {visible ? '▾' : '▸'}
        </span>
      </p>
      {visible && children}
    </div>
  );
}

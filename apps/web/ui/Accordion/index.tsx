import React, { useState } from 'react';
import styles from './index.module.scss';

interface Props {
  header: string;
  children: React.ReactNode;
  expanded?: boolean;
}

export default function Accordion({
  header,
  children,
  expanded = true,
}: Props) {
  const [visible, setVisible] = useState(expanded);

  return (
    <div>
      <p
        className={styles.text}
        onClick={() => setVisible((visible) => !visible)}
      >
        {header}
        <span className={styles.arrow}>{visible ? '▾' : '▸'}</span>
      </p>
      {visible && children}
    </div>
  );
}

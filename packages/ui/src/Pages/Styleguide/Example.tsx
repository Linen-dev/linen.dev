import React from 'react';
import styles from './Example.scss';

interface Props {
  description?: string;
  header?: string;
  children: React.ReactNode;
  inline?: boolean;
}

export default function Example({
  description,
  header,
  children,
  inline,
}: Props) {
  return (
    <>
      <p>{description}</p>
      <div className={styles.container}>
        {header && <h2 className={styles.header}>{header}</h2>}
        <div className={inline && styles.inline}>{children}</div>
      </div>
    </>
  );
}

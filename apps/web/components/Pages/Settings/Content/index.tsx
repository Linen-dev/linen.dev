import React from 'react';
import styles from './index.module.scss';

interface Props {
  communityId: string;
}

export default function Content({ communityId }: Props) {

  return (
    <div className={styles.container}>
      Hello, world!
    </div>
  );
}

import React from 'react';
import styles from './index.module.css';

interface Props {
  children: React.ReactNode;
}

function Card({ children }: Props) {
  return <div className={styles.card}>{children}</div>;
}

export default Card;

import React, { ReactNode } from 'react';
import Card from '../Card';
import LinenLogo from '../LinenLogo';
import styles from './index.module.scss';

interface Props {
  size?: 'md' | 'lg';
  header?: string;
  children?: ReactNode;
}

const CardLayout = ({ size, header, children }: Props) => {
  return (
    <>
      <div className={styles.page}>
        <div className={styles.logo}>
          <a href="/">
            <LinenLogo />
          </a>
        </div>
        <Card size={size}>
          <div className={styles.content}>
            {header && <h1 className={styles.header}>{header}</h1>}
            {children}
          </div>
        </Card>
      </div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
      <div id="preview-portal"></div>
    </>
  );
};

export default CardLayout;

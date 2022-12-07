import React from 'react';
import useDevice from '@linen/hooks/device';
import styles from './index.module.scss';

interface Props {
  left: React.ReactNode;
  right?: React.ReactNode;
  leftRef?: any;
  rightRef?: any;
  onLeftScroll?(): void;
  onRightScroll?(): void;
}

function SidebarLayout({
  left,
  right,
  leftRef,
  rightRef,
  onLeftScroll,
  onRightScroll,
}: Props) {
  const { isMobile } = useDevice();
  return (
    <>
      {(!isMobile || !right) && (
        <div className={styles.left} onScroll={onLeftScroll} ref={leftRef}>
          {left}
        </div>
      )}
      {right && (
        <div className={styles.right}>
          <div
            className={styles.content}
            onScroll={onRightScroll}
            ref={rightRef}
          >
            {right}
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarLayout;

import React from 'react';
import classNames from 'classnames';
import useDevice from '@linen/hooks/device';
import styles from './index.module.scss';

interface Props {
  left: React.ReactNode;
  right?: React.ReactNode;
  leftRef?: any;
  rightRef?: any;
  leftClassName?: any;
  rightClassName?: any;
  onLeftScroll?(): void;
  onRightScroll?(): void;
}

function SidebarLayout({
  left,
  right,
  leftRef,
  rightRef,
  leftClassName,
  rightClassName,
  onLeftScroll,
  onRightScroll,
}: Props) {
  const { isMobile } = useDevice();
  return (
    <>
      {(!isMobile || !right) && (
        <div
          id="sidebar-layout-left"
          className={classNames(styles.left, leftClassName)}
          onScroll={onLeftScroll}
          ref={leftRef}
        >
          {left}
        </div>
      )}
      {right && (
        <div
          id="sidebar-layout-right"
          className={classNames(styles.right, rightClassName)}
        >
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

import React from 'react';
import { Transition } from '@headlessui/react';
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
      <Transition
        show={isMobile && !!right ? false : true}
        className={styles.left}
        onScroll={onLeftScroll}
        ref={leftRef}
      >
        {left}
      </Transition>
      <Transition show={!!right} className={styles.right}>
        {right && (
          <div
            className={styles.content}
            onScroll={onRightScroll}
            ref={rightRef}
          >
            {right}
          </div>
        )}
      </Transition>
    </>
  );
}

export default SidebarLayout;

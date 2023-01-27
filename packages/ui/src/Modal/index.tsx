import React, { Fragment } from 'react';
import classNames from 'classnames';
import { Dialog, Transition } from '@headlessui/react';
import styles from './index.module.scss';

type ModalProps = {
  className?: string;
  open: boolean;
  close: (value: boolean) => void;
  children: any;
  fullscreen?: boolean;
};

export default function Modal({
  className,
  open,
  close,
  children,
  fullscreen,
}: ModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className={classNames(styles.modal, className)}
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter={styles.enter}
          enterFrom={styles.hidden}
          enterTo={styles.visible}
          leave={styles.leave}
          leaveFrom={styles.visible}
          leaveTo={styles.hidden}
        >
          <div className={styles.overlay} />
        </Transition.Child>

        <div className={styles.container}>
          <div className={styles.center}>
            <Transition.Child
              as={Fragment}
              enter={styles.enter}
              enterFrom={styles.start}
              enterTo={styles.stop}
              leave={styles.leave}
              leaveFrom={styles.stop}
              leaveTo={styles.start}
            >
              <Dialog.Panel
                className={classNames(styles.content, {
                  [styles.fullscreen]: fullscreen,
                })}
              >
                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

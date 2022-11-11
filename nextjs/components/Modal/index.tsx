import { Fragment } from 'react';
import classNames from 'classnames';
import { Dialog, Transition } from '@headlessui/react';
import styles from './index.module.scss';

type ModalProps = {
  className?: string;
  open: boolean;
  close: (value: boolean) => void;
  children: any;
  title?: string;
  subtitle?: string;
  fullscreen?: boolean;
};

export default function Modal({
  className,
  open,
  close,
  children,
  title,
  subtitle,
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
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className={classNames(
              {
                'flex min-h-full items-end justify-center text-center sm:items-center sm:p-0':
                  !fullscreen,
              },
              { 'flex min-h-full items-center justify-center p-0': fullscreen }
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  'relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6',
                  { [styles.fullscreen]: fullscreen }
                )}
              >
                {!!title && (
                  <div className="m-5 text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    {!!subtitle && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{subtitle}</p>
                      </div>
                    )}
                  </div>
                )}
                <div>{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

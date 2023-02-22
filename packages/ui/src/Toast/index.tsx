import React from 'react';
import classNames from 'classnames';
import { Toaster, toast } from 'react-hot-toast';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoInfo } from '@react-icons/all-files/go/GoInfo';
import { GoAlert } from '@react-icons/all-files/go/GoAlert';
import styles from './index.module.scss';

function custom({
  message,
  description,
  icon,
}: {
  message: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  toast.custom(() => (
    <div className={styles.container}>
      <div className={styles.toast}>
        {icon}
        <p className={styles.message}>{message}</p>
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  ));
}

const icons = {
  success: <GoCheck className={classNames(styles.icon, styles.green)} />,
  error: <GoAlert className={classNames(styles.icon, styles.red)} />,
  info: <GoInfo className={classNames(styles.icon, styles.blue)} />,
};

const Toast = {
  success(message: string, description?: string) {
    custom({ message, description, icon: icons.success });
  },
  error(message: string, description?: string) {
    custom({ message, description, icon: icons.error });
  },
  info(message: string, description?: string) {
    custom({ message, description, icon: icons.info });
  },
  ToastContext: Toaster,
};

export { Toast as toast, Toaster as ToastContext };
export default Toast;

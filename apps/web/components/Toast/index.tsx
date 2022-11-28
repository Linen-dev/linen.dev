import React from 'react';
import classNames from 'classnames';
import toast from 'react-hot-toast';
export { Toaster } from 'react-hot-toast';
import { GoCheck, GoInfo, GoAlert } from 'react-icons/go';
import styles from './index.module.scss';

function custom({
  message,
  description,
  icon,
}: {
  message: string;
  description?: string;
  icon: React.ReactNode;
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

const methods = {
  success(message: string, description?: string) {
    custom({ message, description, icon: icons.success });
  },
  error(message: string, description?: string) {
    custom({ message, description, icon: icons.error });
  },
  info(message: string, description?: string) {
    custom({ message, description, icon: icons.info });
  },
};

export { methods as toast };
export default methods;

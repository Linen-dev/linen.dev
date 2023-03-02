import React from 'react';
import classNames from 'classnames';
import { Toaster, toast } from 'react-hot-toast';
import { FiCheckSquare } from '@react-icons/all-files/fi/FiCheckSquare';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
import { FiAlertTriangle } from '@react-icons/all-files/fi/FiAlertTriangle';
import styles from './index.module.scss';

const icons = {
  success: <FiCheckSquare className={classNames(styles.icon, styles.green)} />,
  error: <FiAlertTriangle className={classNames(styles.icon, styles.red)} />,
  info: <FiInfo className={classNames(styles.icon, styles.blue)} />,
};

const style = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 500,
};

const Toast = {
  success(message: string) {
    toast.success(message, {
      style,
      icon: icons.success,
    });
  },
  error(message: string) {
    toast.error(message, {
      style,
      icon: icons.error,
    });
  },
  info(message: string) {
    toast.success(message, {
      style,
      icon: icons.info,
    });
  },
  ToastContext: Toaster,
};

export { Toast as toast, Toaster as ToastContext };
export default Toast;

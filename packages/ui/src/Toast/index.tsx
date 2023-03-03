import React from 'react';
import classNames from 'classnames';
import { Toaster, toast } from 'react-hot-toast';
import { FiCheckSquare } from '@react-icons/all-files/fi/FiCheckSquare';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
import { FiAlertTriangle } from '@react-icons/all-files/fi/FiAlertTriangle';
import styles from './index.module.scss';

interface Options {
  duration?: number;
}

const icons = {
  success: <FiCheckSquare className={classNames(styles.icon, styles.green)} />,
  error: <FiAlertTriangle className={classNames(styles.icon, styles.red)} />,
  info: <FiInfo className={classNames(styles.icon, styles.blue)} />,
};

const style = {
  background: 'black',
  borderRadius: '4px',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
};

const Toast = {
  success(message: string, options?: Options) {
    toast.success(message, {
      style,
      icon: icons.success,
      ...options,
    });
  },
  error(message: string, options?: Options) {
    toast.error(message, {
      style,
      icon: icons.error,
      ...options,
    });
  },
  info(message: string, options?: Options) {
    toast.success(message, {
      style,
      icon: icons.info,
      ...options,
    });
  },
  ToastContext: Toaster,
};

export { Toast as toast, Toaster as ToastContext };
export default Toast;

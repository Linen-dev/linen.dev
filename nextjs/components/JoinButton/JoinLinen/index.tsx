import LinenIcon from '../../icons/LinenIcon';
import Link from 'next/link';
import classNames from 'classnames';
import styles from './index.module.css';

export default function JoinLinen() {
  return (
    <Link href="/signup" passHref>
      <a
        className={classNames(
          styles.button,
          'shadow-md text-sm font-medium rounded-md text-blue-500'
        )}
      >
        <LinenIcon className={styles.icon} />
        <span className="hidden sm:inline">Join the conversation</span>
        <span className="sm:hidden inline">Join Linen</span>
      </a>
    </Link>
  );
}

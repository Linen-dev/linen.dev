import styles from './index.module.scss';
import { FiMessageSquare } from '@react-icons/all-files/fi/FiMessageSquare';

interface Props {
  onShare?(): void;
  onInvite?(): void;
}

export default function Empty({ onInvite, onShare }: Props) {
  return (
    <div className={styles.container}>
      <FiMessageSquare className={styles.icon} />
      <h3 className={styles.header}>No conversations</h3>
      <p className={styles.description}>
        Get started by syncing your community.
      </p>
    </div>
  );
}

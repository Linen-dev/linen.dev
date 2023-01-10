import { StickyHeader } from '@linen/ui';
import { FiSettings } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiSettings /> Integrations
      </div>
      <div className={styles.subtitle}>
        All of your community settings in one place
      </div>
    </StickyHeader>
  );
}

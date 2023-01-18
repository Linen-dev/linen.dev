import { StickyHeader } from '@linen/ui';
import { FiFileText } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiFileText /> Configurations
      </div>
      <div className={styles.subtitle}>
        URLs and important community details
      </div>
    </StickyHeader>
  );
}

import { StickyHeader } from '@linen/ui';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiSettings /> Integrations
      </div>
      <div className={styles.subtitle}>Integrate with third-party tools</div>
    </StickyHeader>
  );
}

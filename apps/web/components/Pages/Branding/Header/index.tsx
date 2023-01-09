import { StickyHeader } from '@linen/ui';
import { FiSliders } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiSliders /> Branding
      </div>
      <div className={styles.subtitle}>
        Design made simple
      </div>
    </StickyHeader>
  );
}

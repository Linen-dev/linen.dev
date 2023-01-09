import { StickyHeader } from '@linen/ui';
import { FiUsers } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiUsers /> Members
      </div>
      <div className={styles.subtitle}>
        Invite and change roles of members in your community
      </div>
    </StickyHeader>
  );
}

import StickyHeader from 'components/StickyHeader';
import { FiBarChart } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiBarChart /> Metrics
      </div>
      <div className={styles.subtitle}>
        All of your community metrics in one place
      </div>
    </StickyHeader>
  );
}

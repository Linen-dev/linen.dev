import Spinner from '@linen/ui/Spinner';
import styles from './index.module.scss';

export default function Loading() {
  return (
    <div className={styles.loader}>
      <Spinner />
    </div>
  );
}

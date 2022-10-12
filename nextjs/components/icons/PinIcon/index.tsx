import { GoPin } from 'react-icons/go';
import styles from './index.module.scss';

export default function PinIcon() {
  return (
    <div className={styles.pin}>
      <GoPin />
    </div>
  );
}

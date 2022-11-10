import styles from './index.module.scss';

export default function Spinner() {
  return (
    <div className={styles['spinner-wrapper']}>
      <div className={styles.spinner} role="spinner">
        <div className={styles['spinner-icon']}></div>
      </div>
    </div>
  );
}

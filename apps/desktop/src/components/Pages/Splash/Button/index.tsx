import styles from './index.module.scss';

export default function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}

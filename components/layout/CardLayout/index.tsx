import { ReactNode } from 'react';
import styles from './index.module.css';
import Card from '../../Card';

interface Props {
  header: string;
  children?: ReactNode;
}

const Layout = ({ header, children }: Props) => {
  return (
    <div className={styles.page}>
      <h1 className={styles.header}>{header}</h1>
      <Card>{children}</Card>
    </div>
  );
};

export default Layout;

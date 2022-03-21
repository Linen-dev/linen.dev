import { FunctionComponent, ReactNode } from 'react';
import styles from './index.module.css';
import Card from '../../../components/Card';

interface Props {
  children: ReactNode;
}

const Layout: FunctionComponent = ({ children }: Props) => {
  return (
    <div className={styles.page}>
      <h1 className={styles.header}>Sign Up</h1>
      <Card>{children}</Card>
    </div>
  );
};

export default Layout;

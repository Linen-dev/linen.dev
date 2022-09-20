import { ReactNode } from 'react';
import styles from './index.module.css';
import Card from '../../Card';
import Link from 'next/link';
import LinenLogo from 'components/Logo/Linen';

interface Props {
  header: string;
  children?: ReactNode;
}

const Layout = ({ header, children }: Props) => {
  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <Link className="text-center" href="/">
          <a>
            <LinenLogo />
          </a>
        </Link>
      </div>
      <Card>
        <div className={styles.content}>
          <h1 className={styles.header}>{header}</h1>
          {children}
        </div>
      </Card>
    </div>
  );
};

export default Layout;

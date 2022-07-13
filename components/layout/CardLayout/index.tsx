import { ReactNode } from 'react';
import styles from './index.module.css';
import Card from '../../Card';
import Link from '../../Link';

interface Props {
  header: string;
  children?: ReactNode;
}

const Layout = ({ header, children }: Props) => {
  return (
    <div className={styles.page}>
      <Link href="/">
        <img
          className={styles.logo}
          src="https://linen-assets.s3.amazonaws.com/linen-black-logo.svg"
          alt="Linen logo"
        />
      </Link>
      <div className="px-3">
        <Card>
          <h1 className={styles.header}>{header}</h1>
          {children}
        </Card>
      </div>
    </div>
  );
};

export default Layout;

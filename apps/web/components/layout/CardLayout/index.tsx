import { ReactNode } from 'react';
import styles from './index.module.css';
import Card from '@linen/ui/Card';
import Link from 'next/link';
import LinenLogo from '@linen/ui/LinenLogo';

interface Props {
  header?: string;
  children?: ReactNode;
}

const Layout = ({ header, children }: Props) => {
  return (
    <>
      <div className={styles.page}>
        <div className={styles.logo}>
          <Link className="text-center" href="/">
            <LinenLogo />
          </Link>
        </div>
        <Card>
          <div className={styles.content}>
            {header && <h1 className={styles.header}>{header}</h1>}
            {children}
          </div>
        </Card>
      </div>
      <div id="portal"></div>
    </>
  );
};

export default Layout;

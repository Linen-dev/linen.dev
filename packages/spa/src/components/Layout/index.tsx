import { Outlet } from 'react-router-dom';
import NavTopBar from '../NavTopBar';
import styles from './index.module.scss';
import NavLeftBar from '../NavLeftBar';

export default function Layout() {
  return (
    <>
      <NavTopBar />
      <div className={styles.layout}>
        <NavLeftBar />
        <div className={styles.container}>
          <Outlet />
        </div>
      </div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
    </>
  );
}

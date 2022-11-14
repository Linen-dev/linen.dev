import { useEffect, useState } from 'react';
import { get } from '../utilities/http';
import styles from './index.module.scss';

function App() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    get('/api/health')
      .then(async () => {
        if (mounted) {
          setActive(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setActive(false);
        }
      });
    const intervalId = setInterval(() => {
      get('/api/health')
        .then(async () => {
          if (mounted) {
            setActive(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setActive(false);
          }
        });
    }, 5000);

    return () => {
      clearInterval(intervalId);
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <h1>Welcome to Linen!</h1>
      <p>Linen is: {active ? 'Online' : 'Offline'}</p>
    </div>
  );
}

export default App;

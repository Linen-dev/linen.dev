import React, { useEffect, useState } from 'react';
import Field from '@/Field';
import Label from '@/Label';
import Toast from '@/Toast';
import Toggle from '@/Toggle';
import { localStorage } from '@linen/utilities/storage';
import styles from './index.module.scss';

export default function PermissionsField() {
  const granted = localStorage.get('notification.permission') === 'granted';
  const [checked, setChecked] = useState<boolean>(granted);
  const [settings, setSettings] = useState();
  const [checkedEmail, setCheckedEmail] = useState<boolean>(false);

  useEffect(() => {
    if (!settings) {
      fetch('/api/notifications/settings')
        .then((res) => res.json())
        .then((res) => {
          setSettings(res);
          setCheckedEmail(res.notificationsByEmail);
        });
    }
  }, []);

  const onEmailSettingsChange = async () => {
    const notificationsByEmail = !checkedEmail;
    try {
      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationsByEmail }),
      });
      setCheckedEmail(notificationsByEmail);
    } catch (error) {
      Toast.info('Something went wrong');
    }
  };

  return (
    <Field>
      <Label htmlFor="notification">Notifications</Label>
      <div className={styles.wrapper}>
        <div className={styles.subWrapper}>
          <Toggle
            checked={checked}
            onChange={() => {
              if (checked) {
                localStorage.set('notification.permission', 'denied');
                Toast.info('Notifications are disabled');
                new Notification('Notifications are disabled');
                setChecked(false);
              } else if (window.Notification) {
                window.Notification.requestPermission((permission) => {
                  localStorage.set('notification.permission', permission);
                  if (permission === 'granted') {
                    setChecked(true);
                    Toast.info('Notifications are enabled');
                    new Notification('Notifications are enabled');
                  } else {
                    setChecked(false);
                    Toast.info('Notifications are disabled');
                  }
                });
              } else {
                Toast.error('Notifications are not supported in your browser');
              }
            }}
          />
          <span>Web</span>
        </div>
        <div className={styles.subWrapper}>
          {!settings ? (
            'Loading...'
          ) : (
            <Toggle checked={checkedEmail} onChange={onEmailSettingsChange} />
          )}
          <span>Email</span>
        </div>
      </div>
    </Field>
  );
}

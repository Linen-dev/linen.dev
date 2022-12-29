import React, { useEffect, useState } from 'react';
import Field from 'components/Field';
import Toggle from 'components/Toggle';
import { Label } from '@linen/ui';
import { Toast } from '@linen/ui';
import storage from '@linen/utilities/storage';
import { useRequest } from 'utilities/requests';

export default function PermissionsField() {
  const granted = storage.get('notification.permission') === 'granted';
  const [checked, setChecked] = useState<boolean>(granted);
  const settings = useRequest('/notifications/settings');
  const [checkedEmail, setCheckedEmail] = useState<boolean>(false);

  useEffect(() => {
    if (settings.data) {
      setCheckedEmail(settings.data.notificationsByEmail);
    }
  }, [settings.data]);

  const onEmailSettingsChange = async () => {
    const notificationsByEmail = !checkedEmail;
    try {
      setCheckedEmail(notificationsByEmail);
      await settings.update({ notificationsByEmail });
    } catch (error) {
      setCheckedEmail(!notificationsByEmail);
      Toast.info('Something went wrong');
    }
  };

  return (
    <Field>
      <Label htmlFor="notification">Notifications</Label>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex h-6 gap-1 items-center">
          <Toggle
            checked={checked}
            onChange={() => {
              if (checked) {
                storage.set('notification.permission', 'denied');
                Toast.info('Notifications are disabled');
                new Notification('Notifications are disabled');
                setChecked(false);
              } else if (window.Notification) {
                window.Notification.requestPermission((permission) => {
                  storage.set('notification.permission', permission);
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
        <div className="flex h-6 gap-1 items-center">
          {settings.isLoading ? (
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

import React, { useState } from 'react'
import Field from 'components/Field'
import Toggle from 'components/Toggle'
import { Label } from '@linen/ui'
import { Toast } from '@linen/ui'
import storage from '@linen/utilities/storage'

export default function PermissionsField () {
  const granted = storage.get('notification.permission') === 'granted'
  const [checked, setChecked] = useState<boolean>(granted)

  return (
    <Field>
      <Label>Notifications</Label>
        <Toggle checked={checked} onChange={() => {
          if (checked) {
            storage.set('notification.permission', 'denied')
            Toast.info('Notifications are disabled')
            setChecked(false)
          } else if (window.Notification) {
            window.Notification.requestPermission((permission) => {
              storage.set('notification.permission', permission)
              if (permission === 'granted') {
                setChecked(true)
                Toast.info('Notifications are enabled')
                new Notification('Notifications are enabled')
              } else {
                setChecked(false)
                Toast.info('Notifications are disabled')
              }
            })
          } else {
            Toast.error('Notifications are not supported in your browser')
          }
        }} />
    </Field>
  )
}

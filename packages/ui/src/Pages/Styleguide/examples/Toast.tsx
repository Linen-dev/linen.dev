import React from 'react';
import Example from '../Example';
import Button from '@/Button';
import Toast from '@/Toast';

export default function TextareaExample() {
  return (
    <Example header="Toast">
      <Example description="Toasts can have different states.">
        <div>
          <Button onClick={() => Toast.success('Lorem ipsum')}>Success</Button>
        </div>
        <div>
          <Button onClick={() => Toast.error('Lorem ipsum')}>Error</Button>
        </div>
        <div>
          <Button onClick={() => Toast.info('Lorem ipsum')}>info</Button>
        </div>
      </Example>
    </Example>
  );
}

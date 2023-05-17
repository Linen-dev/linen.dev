import React from 'react';
import Example from '../Example';
import Alert from '@/Alert';

export default function AlertExample() {
  return (
    <Example header="Alert">
      <Example description="Alert can have a danger type.">
        <Alert type="danger">Lorem ipsum dolor sit amet</Alert>
      </Example>
      <Example description="Alert can have an info type.">
        <Alert type="info">Lorem ipsum dolor sit amet</Alert>
      </Example>
    </Example>
  );
}

import React from 'react';
import Example from '../Example';
import Progress from '@/Progress';

export default function ProgressExample() {
  return (
    <Example header="Progress">
      <Progress value={50} />
    </Example>
  );
}

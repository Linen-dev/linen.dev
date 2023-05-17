import React from 'react';
import Example from '../Example';
import Textarea from '@/Textarea';

export default function TextareaExample() {
  return (
    <Example header="Textarea">
      <Example description="Textarea can have a label.">
        <Textarea label="Message" name="textarea-foo" />
      </Example>
    </Example>
  );
}

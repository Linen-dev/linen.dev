import React, { useState } from 'react';
import Field from 'components/Field';
import Label from 'components/Label';
import Textarea from 'components/Textarea';
import Message from 'components/Message';

interface Props {
  label?: string;
  defaultValue?: string;
  name: string;
}

function MessageField({ label, defaultValue, name }: Props) {
  const [value, setValue] = useState(defaultValue || '');
  const [preview, setPreview] = useState(false);
  return (
    <Field>
      {label && <Label htmlFor={name}>{label}</Label>}
      <a
        onClick={() => setPreview((preview) => !preview)}
        className="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-sm cursor-pointer"
      >
        {preview ? 'Write' : 'Preview'}
      </a>
      <Textarea
        name={name}
        defaultValue={defaultValue}
        hidden={preview}
        onChange={(event) => setValue(event.target.value)}
      />
      {preview && <Message text={value} />}
    </Field>
  );
}

export default MessageField;

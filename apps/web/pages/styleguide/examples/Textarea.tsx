import Example from '../Example';
import { Textarea } from '@linen/ui';

export default function TextareaExample() {
  return (
    <Example header="Textarea">
      <Example description="Textarea can have a label.">
        <Textarea label="Message" name="textarea-foo" />
      </Example>
    </Example>
  );
}

import Example from '../Example';
import MessageField from 'components/MessageField';

export default function MessageFieldExample() {
  return (
    <Example header="MessageField">
      <Example description="Renders a label.">
        <MessageField label="Message" name="message-field-foo" />
      </Example>
    </Example>
  );
}

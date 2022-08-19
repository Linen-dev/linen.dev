import Example from '../Example';
import MessageInput from 'components/MessageInput';

export default function MessageInputExample() {
  return (
    <Example header="MessageInput">
      <Example description="MessageInput can have a label.">
        <MessageInput label="Message" name="message-input-foo" />
      </Example>
    </Example>
  );
}

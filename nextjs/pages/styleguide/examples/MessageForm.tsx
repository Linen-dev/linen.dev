import Example from '../Example';
import MessageForm from 'components/MessageForm';

export default function MessageFormExample() {
  return (
    <Example header="MessageForm">
      <Example description="Renders a label.">
        <MessageForm channelId={''} threadId={null} />
      </Example>
    </Example>
  );
}

import Example from '../Example';
import MessageField from 'components/MessageField';

const MESSAGE = `
# What is Linen?

*Linen* syncs your Slack and Discord threads to an _SEO_ friendly website that allows your community to discover you through search engines and reduces the number of repeat questions.
`.trim();

export default function MessageFieldExample() {
  return (
    <Example header="MessageField">
      <Example description="Renders a label.">
        <MessageField
          label="Message"
          name="message-field-foo"
          defaultValue={MESSAGE}
        />
      </Example>
    </Example>
  );
}

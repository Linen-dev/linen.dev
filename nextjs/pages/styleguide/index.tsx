import Layout from './Layout';
import AlertExample from './examples/Alert';
import ButtonGroupExample from './examples/ButtonGroup';
import TextareaExample from './examples/Textarea';
import MessageFormExample from './examples/MessageForm';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';

export default function Styleguide() {
  return (
    <Layout>
      <ButtonGroupExample />
      <MessageFormExample />
      <MessageExample />
      <TextInputExample />
      <TextareaExample />
      <NativeSelectExample />
      <AlertExample />
    </Layout>
  );
}

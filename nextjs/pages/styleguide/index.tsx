import Layout from './Layout';
import AlertExample from './examples/Alert';
import TextareaExample from './examples/Textarea';
import MessageFieldExample from './examples/MessageField';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';

export default function Styleguide() {
  return (
    <Layout>
      <MessageFieldExample />
      <MessageExample />
      <TextInputExample />
      <TextareaExample />
      <NativeSelectExample />
      <AlertExample />
    </Layout>
  );
}

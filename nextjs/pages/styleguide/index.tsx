import Layout from './Layout';
import AlertExample from './examples/Alert';
import TextareaExample from './examples/Textarea';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';

export default function Styleguide() {
  return (
    <Layout>
      <MessageExample />
      <TextInputExample />
      <TextareaExample />
      <NativeSelectExample />
      <AlertExample />
    </Layout>
  );
}

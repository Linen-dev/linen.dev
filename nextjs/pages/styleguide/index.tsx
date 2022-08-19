import Layout from './Layout';
import AlertExample from './examples/Alert';
import MessageInputExample from './examples/MessageInput';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';

export default function Styleguide() {
  return (
    <Layout>
      <MessageInputExample />
      <MessageExample />
      <TextInputExample />
      <NativeSelectExample />
      <AlertExample />
    </Layout>
  );
}

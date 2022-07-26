import Layout from './Layout';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';

export default function Styleguide() {
  return (
    <Layout>
      <MessageExample />
      <TextInputExample />
      <NativeSelectExample />
    </Layout>
  );
}

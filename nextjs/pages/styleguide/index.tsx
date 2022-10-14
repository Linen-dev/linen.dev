import Layout from './Layout';
import AlertExample from './examples/Alert';
import ButtonGroupExample from './examples/ButtonGroup';
import SuggestionsExample from './examples/Suggestions';
import TextareaExample from './examples/Textarea';
import MessageFormExample from './examples/MessageForm';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';
import ToastExample from './examples/Toast';

export default function Styleguide() {
  return (
    <Layout>
      <SuggestionsExample />
      <ButtonGroupExample />
      <MessageFormExample />
      <MessageExample />
      <TextInputExample />
      <TextareaExample />
      <NativeSelectExample />
      <AlertExample />
      <ToastExample />
    </Layout>
  );
}

import React from 'react';
import Layout from './Layout';
import AlertExample from './examples/Alert';
import ButtonGroupExample from './examples/ButtonGroup';
import TextareaExample from './examples/Textarea';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';
import NavExample from './examples/Nav';
import ToastExample from './examples/Toast';

export default function Styleguide() {
  return (
    <Layout>
      <NavExample />
      <ButtonGroupExample />
      <MessageExample />
      <TextInputExample />
      <TextareaExample />
      <NativeSelectExample />
      <AlertExample />
      <ToastExample />
    </Layout>
  );
}

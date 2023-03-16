import React from 'react';
import Layout from './Layout';
import AvatarExample from './examples/Avatar';
import AlertExample from './examples/Alert';
import ButtonGroupExample from './examples/ButtonGroup';
import TextareaExample from './examples/Textarea';
import MessageExample from './examples/Message';
import TextInputExample from './examples/TextInput';
import NativeSelectExample from './examples/NativeSelect';
import NavExample from './examples/Nav';
import ToastExample from './examples/Toast';
import ProgressExample from './examples/Progress';
import IconExample from './examples/Icon';

export default function Styleguide() {
  return (
    <Layout>
      <AvatarExample />
      <IconExample />
      <ProgressExample />
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

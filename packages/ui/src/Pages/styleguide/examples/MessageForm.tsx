import React from 'react';
import Example from '../Example';
import MessageForm from '../../../../../../apps/web/components/MessageForm';

export default function MessageFormExample() {
  return (
    <Example header="MessageForm">
      <Example description="Renders a label.">
        <MessageForm progress={0} uploads={[]} />
      </Example>
    </Example>
  );
}

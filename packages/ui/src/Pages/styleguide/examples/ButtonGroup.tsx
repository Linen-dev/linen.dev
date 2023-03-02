import React from 'react';
import Example from '../Example';
import { Button, ButtonGroup } from '@linen/ui';

export default function ButtonGroupExample() {
  return (
    <Example header="ButtonGroup">
      <Example description="Button group can have multiple buttons.">
        <ButtonGroup>
          <Button color="white" size="xs" rounded="full">
            Active
          </Button>
          <Button color="transparent" size="xs" rounded="full">
            Closed
          </Button>
        </ButtonGroup>
      </Example>
    </Example>
  );
}

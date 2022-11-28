import Example from '../Example';
import { Button } from '@linen/ui';
import { Toast } from '@linen/ui';

export default function TextareaExample() {
  return (
    <Example header="Toast">
      <Example description="Toasts can have different states.">
        <div>
          <Button
            onClick={() => Toast.success('Lorem ipsum', 'dolor sit amet')}
          >
            Success
          </Button>
        </div>
        <div>
          <Button onClick={() => Toast.error('Lorem ipsum')}>Error</Button>
        </div>
        <div>
          <Button onClick={() => Toast.info('Lorem ipsum')}>info</Button>
        </div>
      </Example>
    </Example>
  );
}

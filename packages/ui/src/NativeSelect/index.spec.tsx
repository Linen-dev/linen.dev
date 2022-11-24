import React from 'react';
import NativeSelect from '.';
import { render } from '@testing-library/react';

describe('NativeSelect', () => {
  it('renders options', () => {
    const { container } = render(
      <NativeSelect
        id="select-input-foo"
        options={[
          { label: 'Option 1', value: 'option-1' },
          { label: 'Option 2', value: 'option-2' },
        ]}
      />
    );
    expect(container).toHaveTextContent('Option 1');
    expect(container).toHaveTextContent('Option 2');
  });
});

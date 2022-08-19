import React from 'react';
import { getByLabelText, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageField from '.';

describe('MessageField', () => {
  it('renders a textarea', () => {
    const { container } = render(<MessageField name="foo" />);
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  it('renders a label', () => {
    const { container } = render(<MessageField label="foo" name="bar" />);
    expect(container).toHaveTextContent('foo');
  });

  it('renders a preview', async () => {
    const { container, getByLabelText, getByText } = render(
      <MessageField label="foo" name="bar" />
    );
    const textarea = getByLabelText('foo');
    await userEvent.type(textarea, 'Lorem ipsum, *dolor* sit amet');
    const button = getByText('Preview');
    await userEvent.click(button);
    expect(container).toHaveTextContent('Lorem ipsum, dolor sit amet');
  });
});

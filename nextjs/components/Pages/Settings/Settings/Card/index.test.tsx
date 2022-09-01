import Card from '.';
import { render } from '@testing-library/react';

describe('Card', () => {
  it('renders the header', () => {
    const { container } = render(<Card header="foo" description="bar" />);
    expect(container).toHaveTextContent('foo');
  });

  it('renders the description', () => {
    const { container } = render(<Card header="foo" description="bar" />);
    expect(container).toHaveTextContent('bar');
  });
});

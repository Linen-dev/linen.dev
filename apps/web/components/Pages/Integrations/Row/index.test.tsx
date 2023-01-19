import Row from '.';
import { render } from '@testing-library/react';

describe('Row', () => {
  it('renders the header', () => {
    const { container } = render(
      <Row header="foo" description="bar" action="baz" />
    );
    expect(container).toHaveTextContent('foo');
  });

  it('renders the description', () => {
    const { container } = render(
      <Row header="foo" description="bar" action="baz" />
    );
    expect(container).toHaveTextContent('bar');
  });

  it('renders the action', () => {
    const { container } = render(
      <Row header="foo" description="bar" action="baz" />
    );
    expect(container).toHaveTextContent('baz');
  });
});

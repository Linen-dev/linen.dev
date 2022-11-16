import { List } from '.';
import { render } from '@testing-library/react';

describe('List', () => {
  it('renders a list', () => {
    const { getByText } = render(
      <List>
        <li>foo</li>
      </List>
    );
    const item = getByText('foo');
    expect(item).toBeDefined();
  });
});

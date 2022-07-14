import { render } from '@testing-library/react';
import Home from '../../pages/index';

describe('Home', () => {
  it('renders a header', () => {
    const { container } = render(<Home accounts={[]} />);
    expect(container).toHaveTextContent(
      'Make Slack and Discord communities Google-searchable'
    );
  });
});

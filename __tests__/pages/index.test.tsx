import { render } from '@testing-library/react';
import Home from '../../pages/index';

describe('Home', () => {
  it('renders a header', () => {
    const { container } = render(<Home />);
    expect(container).toHaveTextContent(
      'Turn Slack community into a Q&A website'
    );
  });
});

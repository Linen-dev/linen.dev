import React from 'react';
import { render } from '@testing-library/react';
import Paragraph from '.';

describe('Paragraph', () => {
  it('renders bold text', () => {
    const token = {
      type: 'paragraph',
      text: '*hey*',
      raw: '*hey*',
      tokens: [{ type: 'em', text: 'hey', raw: 'hey' }],
    };
    const { container } = render(<Paragraph token={token} />);
    expect(container.querySelector('strong')).toHaveTextContent('hey');
    expect(container).not.toHaveTextContent('*hey*');
  });

  it('decodes html entities', () => {
    const token = {
      type: 'paragraph',
      text: '&lt;&gt;',
      raw: '&lt;&gt;',
      tokens: [{ type: 'text', text: '&lt;&gt;', raw: '&lt;&gt;' }],
    };
    const { container } = render(<Paragraph token={token} />);
    expect(container).toHaveTextContent('<>');
    expect(container).not.toHaveTextContent('&lt;&gt;');
  });

  it('renders whitespace', () => {
    const token = {
      type: 'space',
      raw: 'lorem',
    };
    const { container } = render(<Paragraph token={token} />);
    expect(container).toHaveTextContent('lorem');
  });
});

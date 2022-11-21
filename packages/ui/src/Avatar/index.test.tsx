import React from 'react';
import Avatar from '.';
import { render } from '@testing-library/react';

describe('Avatar', () => {
  it('renders an avatar', () => {
    const { container } = render(<Avatar text="a" />);
    expect(container).toHaveTextContent('a');
  });

  it('renders size classes', () => {
    const { container } = render(<Avatar text="a" />);
    expect(container.querySelector('.md')).toBeInTheDocument();
  });

  it('changes the text into a letter', () => {
    const { container } = render(<Avatar text="John" />);
    expect(container).toHaveTextContent('j');
  });

  describe('when size is set to sm', () => {
    it('renders size classes', () => {
      const { container } = render(<Avatar text="a" size="sm" />);
      expect(container.querySelector('.sm')).toBeInTheDocument();
    });
  });

  describe('when shadow is set to none', () => {
    it('does not apply the shadow class', () => {
      const { container } = render(<Avatar text="a" shadow="none" />);
      expect(container.querySelector('.shadow')).not.toBeInTheDocument();
    });
  });
});

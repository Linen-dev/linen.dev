import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import Autocomplete from '.';
import userEvent from '@testing-library/user-event';

describe('Autocomplete', () => {
  it('renders an input', () => {
    const { container } = render(
      <Autocomplete
        brandColor="#fff"
        fetch={() => Promise.resolve([])}
        onSelect={jest.fn()}
        renderSuggestion={() => null}
      />
    );
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('renders results', async () => {
    const { container, getByPlaceholderText } = render(
      <Autocomplete
        brandColor="#fff"
        fetch={() => Promise.resolve([{ id: 1, name: 'super test' }])}
        onSelect={jest.fn()}
        renderSuggestion={({ name }) => <div>{name}</div>}
      />
    );
    const input = getByPlaceholderText('Search');
    await userEvent.type(input, 'test');
    await waitFor(() => expect(container).toHaveTextContent('super test'));
  });

  describe('when a resuls is selected', () => {
    it('calls onSelect', async () => {
      const onSelect = jest.fn();
      const { container, getByPlaceholderText, getByText } = render(
        <Autocomplete
          brandColor="#fff"
          fetch={() => Promise.resolve([{ id: 1, name: 'super test' }])}
          onSelect={onSelect}
          renderSuggestion={({ name }) => <div>{name}</div>}
        />
      );
      const input = getByPlaceholderText('Search');
      await userEvent.type(input, 'test');
      await waitFor(() => expect(container).toHaveTextContent('super test'));
      userEvent.click(getByText('super test'));
      await waitFor(() => expect(onSelect).toHaveBeenCalled());
    });
  });

  describe('when placeholder is passed', () => {
    it('renders a custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <Autocomplete
          brandColor="#fff"
          fetch={() => Promise.resolve([])}
          onSelect={jest.fn()}
          renderSuggestion={() => null}
          placeholder="Search messages"
        />
      );
      expect(getByPlaceholderText('Search messages')).toBeInTheDocument();
    });
  });
});

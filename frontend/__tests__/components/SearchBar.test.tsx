import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('calls onSearch with query on form submit', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search medications...');
    await user.type(input, '  diabetes  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith('  diabetes  ');
  });

  it('does not call onSearch for whitespace-only query', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search medications...');
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch when Enter is pressed in the input', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText('Search medications...');
    await user.type(input, 'metformin{Enter}');

    expect(onSearch).toHaveBeenCalledWith('metformin');
  });

  it('disables button when isLoading', () => {
    render(<SearchBar onSearch={vi.fn()} isLoading />);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('disables button when query is empty', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });
});

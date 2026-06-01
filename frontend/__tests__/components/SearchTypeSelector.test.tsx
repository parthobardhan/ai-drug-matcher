import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchTypeSelector from '@/components/SearchTypeSelector';

describe('SearchTypeSelector', () => {
  it('invokes onTypeChange when each search type is clicked', async () => {
    const onTypeChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SearchTypeSelector selectedType="hybrid" onTypeChange={onTypeChange} />
    );

    await user.click(screen.getByRole('button', { name: /vector search/i }));
    expect(onTypeChange).toHaveBeenCalledWith('vector');

    await user.click(screen.getByRole('button', { name: /full-text search/i }));
    expect(onTypeChange).toHaveBeenCalledWith('fulltext');

    await user.click(screen.getByRole('button', { name: /hybrid search/i }));
    expect(onTypeChange).toHaveBeenCalledWith('hybrid');
  });

  it('applies active styling to the selected type', () => {
    render(
      <SearchTypeSelector selectedType="vector" onTypeChange={vi.fn()} />
    );

    const vectorButton = screen.getByRole('button', { name: /vector search/i });
    const hybridButton = screen.getByRole('button', { name: /hybrid search/i });

    expect(vectorButton.className).toContain('border-blue-500');
    expect(vectorButton.className).toContain('bg-blue-50');
    expect(hybridButton.className).not.toContain('border-blue-500');
  });
});

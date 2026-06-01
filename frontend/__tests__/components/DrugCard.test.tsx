import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DrugCard from '@/components/DrugCard';
import { mockDrug } from '../fixtures/drugs';
import type { Drug } from '@/lib/api';

describe('DrugCard', () => {
  it('renders drug name, generic name, and tier label', () => {
    render(<DrugCard drug={mockDrug} />);

    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getByText('metformin hydrochloride')).toBeInTheDocument();
    expect(screen.getByText('Tier 1 - Preferred Generic')).toBeInTheDocument();
  });

  it('renders score badge when showScore is true and score is set', () => {
    render(<DrugCard drug={{ ...mockDrug, score: 0.85 }} showScore />);

    expect(screen.getByText('Score: 0.850')).toBeInTheDocument();
  });

  it('hides score badge when showScore is false', () => {
    render(<DrugCard drug={{ ...mockDrug, score: 0.85 }} showScore={false} />);

    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
  });

  it('expands and collapses detail sections', async () => {
    const user = userEvent.setup();
    render(<DrugCard drug={mockDrug} />);

    expect(screen.queryByText('Common Side Effects:')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /show details/i }));

    expect(screen.getByText('Common Side Effects:')).toBeInTheDocument();
    expect(screen.getByText('nausea')).toBeInTheDocument();
    expect(screen.getByText('Drug Interactions:')).toBeInTheDocument();
    expect(screen.getByText('contrast dye')).toBeInTheDocument();
    expect(screen.getByText('Keywords:')).toBeInTheDocument();
    expect(screen.getByText('diabetes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /hide details/i }));

    expect(screen.queryByText('Common Side Effects:')).not.toBeInTheDocument();
  });

  it.each([
    [1, 'Tier 1 - Preferred Generic'],
    [2, 'Tier 2 - Generic'],
    [3, 'Tier 3 - Preferred Brand'],
    [4, 'Tier 4 - Non-Preferred'],
    [5, 'Tier 5 - Specialty'],
  ])('renders tier %i label', (tier, label) => {
    const drug: Drug = { ...mockDrug, formulary_tier: tier };
    render(<DrugCard drug={drug} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('falls back gracefully for unknown tier', () => {
    const unknownTierDrug: Drug = {
      ...mockDrug,
      formulary_tier: 99,
    };

    render(<DrugCard drug={unknownTierDrug} />);

    expect(screen.getByText('Tier 99')).toBeInTheDocument();
  });
});

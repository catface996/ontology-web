import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mocks ----
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../contexts/HeaderContext', () => ({
  useHeader: () => ({ setBreadcrumbs: vi.fn(), setActions: vi.fn() }),
}));

const mockCurrentOntologyId = { current: 1 as number | null };
vi.mock('../../contexts/OntologyContext', () => ({
  useCurrentOntology: () => ({ currentOntologyId: mockCurrentOntologyId.current }),
}));

const mockListRelations = vi.fn();
const mockDeleteRelation = vi.fn();
vi.mock('../../services/coreService', () => ({
  listRelations: (...args: unknown[]) => mockListRelations(...args),
  deleteRelation: (...args: unknown[]) => mockDeleteRelation(...args),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
    },
  };
});

import RelationsPage from '../RelationsPage';

// ---- Fixtures ----
const mockRelations = [
  {
    id: 1, name: 'worksFor', description: 'Employment relation',
    domainClassName: 'Person', rangeClassName: 'Organization',
    isFunctional: true, isInverseFunctional: false, isSymmetric: false, isTransitive: false,
  },
  {
    id: 2, name: 'locatedIn', description: 'Location relation',
    domainClassName: 'Organization', rangeClassName: 'Location',
    isFunctional: false, isInverseFunctional: false, isSymmetric: false, isTransitive: true,
  },
];

describe('RelationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentOntologyId.current = 1;
    mockListRelations.mockResolvedValue({ data: mockRelations });
    mockDeleteRelation.mockResolvedValue({ data: null });
  });

  describe('list loading', () => {
    it('renders table with relation data after loading', async () => {
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('worksFor')).toBeInTheDocument();
      });

      expect(screen.getByText('locatedIn')).toBeInTheDocument();
      // Person and Organization appear in multiple rows/columns; just check they exist
      expect(screen.getAllByText('Person').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Organization').length).toBeGreaterThanOrEqual(1);
    });

    it('shows relation count', async () => {
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('2 relations')).toBeInTheDocument();
      });
    });

    it('renders property tags (Functional, Transitive)', async () => {
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('Functional')).toBeInTheDocument();
      });
      expect(screen.getByText('Transitive')).toBeInTheDocument();
    });
  });

  describe('search filtering', () => {
    it('filters relations by name when typing in search input', async () => {
      const user = userEvent.setup();
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('worksFor')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search relations...');
      await user.type(searchInput, 'works');

      expect(screen.getByText('worksFor')).toBeInTheDocument();
      expect(screen.queryByText('locatedIn')).not.toBeInTheDocument();
      expect(screen.getByText('1 relations')).toBeInTheDocument();
    });
  });

  describe('delete confirmation', () => {
    it('shows delete modal and confirms deletion', async () => {
      const user = userEvent.setup();
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('worksFor')).toBeInTheDocument();
      });

      // Find delete buttons in table rows
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const trashButtons = actionButtons.filter((btn) => btn.closest('td'));

      // Each row has 2 action buttons: Pencil, Trash2
      if (trashButtons.length >= 2) {
        await user.click(trashButtons[1]); // first row's delete button
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Relation')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(mockDeleteRelation).toHaveBeenCalled();
      });
    });

    it('cancels delete modal', async () => {
      const user = userEvent.setup();
      render(<RelationsPage />);

      await waitFor(() => {
        expect(screen.getByText('worksFor')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: '' });
      const trashButtons = actionButtons.filter((btn) => btn.closest('td'));
      if (trashButtons.length >= 2) {
        await user.click(trashButtons[1]);
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Relation')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockDeleteRelation).not.toHaveBeenCalled();
      });
    });
  });
});

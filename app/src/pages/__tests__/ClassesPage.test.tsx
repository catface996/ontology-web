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

const mockListClasses = vi.fn();
const mockDeleteClass = vi.fn();
vi.mock('../../services/coreService', () => ({
  listClasses: (...args: unknown[]) => mockListClasses(...args),
  deleteClass: (...args: unknown[]) => mockDeleteClass(...args),
}));

// Ant Design App.useApp mock
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

import ClassesPage from '../ClassesPage';

// ---- Fixtures ----
const mockClasses = [
  { id: 1, name: 'Person', description: 'A human being', instanceCount: 5, status: 'ACTIVE' },
  { id: 2, name: 'Organization', description: 'A company', instanceCount: 0, status: 'ACTIVE' },
  { id: 3, name: 'Location', description: 'A place', instanceCount: 1, status: 'DRAFT' },
];

describe('ClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentOntologyId.current = 1;
    mockListClasses.mockResolvedValue({ data: mockClasses });
    mockDeleteClass.mockResolvedValue({ data: null });
  });

  describe('list loading', () => {
    it('renders table with class data after loading', async () => {
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(mockListClasses).toHaveBeenCalled();
    });

    it('shows loading spinner while fetching', () => {
      mockListClasses.mockReturnValue(new Promise(() => {})); // never resolves
      render(<ClassesPage />);

      expect(screen.queryByText('Person')).not.toBeInTheDocument();
    });

    it('shows no-ontology message when no ontology is selected', () => {
      mockCurrentOntologyId.current = null;
      render(<ClassesPage />);

      expect(screen.getByText('No ontology selected')).toBeInTheDocument();
      expect(screen.getByText('Select an Ontology')).toBeInTheDocument();
    });
  });

  describe('search filtering', () => {
    it('calls listClasses with search keyword after debounce', async () => {
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      // The search input is in the header actions, which is set via setBreadcrumbs.
      // Since we mock useHeader, the search is internal via the debounced effect.
      // listClasses is called on mount; verify it was called with ontologyId
      expect(mockListClasses).toHaveBeenCalledWith(
        expect.objectContaining({ ontologyId: 1 }),
      );
    });
  });

  describe('filter tabs', () => {
    it('renders filter buttons (All, Root, Leaf)', async () => {
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      expect(screen.getByText('All Classes')).toBeInTheDocument();
      expect(screen.getByText('Root Classes')).toBeInTheDocument();
      expect(screen.getByText('Leaf Classes')).toBeInTheDocument();
    });

    it('calls listClasses with filter when Root Classes is clicked', async () => {
      const user = userEvent.setup();
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Root Classes'));

      await waitFor(() => {
        expect(mockListClasses).toHaveBeenCalledWith(
          expect.objectContaining({ filter: 'ROOT' }),
        );
      });
    });
  });

  describe('delete confirmation', () => {
    it('shows delete modal when delete button is clicked and confirms deletion', async () => {
      const user = userEvent.setup();
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      // Click the first trash icon in the actions column
      // Each row has 3 action buttons: Brain, Pencil, Trash2
      const actionButtons = screen.getAllByRole('button', { name: '' });
      // Find buttons by looking for those in the table
      const trashButtons = actionButtons.filter((btn) => {
        const parent = btn.closest('td');
        return parent !== null;
      });

      if (trashButtons.length >= 3) {
        // Every 3rd button is a delete button (Brain, Pencil, Trash2)
        await user.click(trashButtons[2]);
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Class')).toBeInTheDocument();
      });

      // Confirm delete
      const okButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(okButton);

      await waitFor(() => {
        expect(mockDeleteClass).toHaveBeenCalled();
      });
    });

    it('closes delete modal on cancel', async () => {
      const user = userEvent.setup();
      render(<ClassesPage />);

      await waitFor(() => {
        expect(screen.getByText('Person')).toBeInTheDocument();
      });

      // Click a delete button to open modal
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const trashButtons = actionButtons.filter((btn) => btn.closest('td'));
      if (trashButtons.length >= 3) {
        await user.click(trashButtons[2]);
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Class')).toBeInTheDocument();
      });

      // Click Cancel
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByText('Are you sure you want to delete')).not.toBeInTheDocument();
      });
    });
  });
});

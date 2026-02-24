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

const mockListProperties = vi.fn();
const mockDeleteProperty = vi.fn();
vi.mock('../../services/coreService', () => ({
  listProperties: (...args: unknown[]) => mockListProperties(...args),
  deleteProperty: (...args: unknown[]) => mockDeleteProperty(...args),
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

import PropertiesPage from '../PropertiesPage';

// ---- Fixtures ----
const mockProperties = [
  { id: 1, name: 'email', description: 'Email address', dataType: 'String', isRequired: true },
  { id: 2, name: 'age', description: 'Age in years', dataType: 'Integer', isRequired: false },
  { id: 3, name: 'birthDate', description: 'Date of birth', dataType: 'Date', isRequired: true },
];

describe('PropertiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentOntologyId.current = 1;
    mockListProperties.mockResolvedValue({ data: mockProperties });
    mockDeleteProperty.mockResolvedValue({ data: null });
  });

  describe('list loading', () => {
    it('renders table with property data after loading', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });

      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('birthDate')).toBeInTheDocument();
    });

    it('shows property count', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('3 properties')).toBeInTheDocument();
      });
    });

    it('displays data types correctly', async () => {
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });

      // Data type column shows String, Integer, Date
      expect(screen.getAllByText('String').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Integer').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Date').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('search filtering', () => {
    it('filters properties by name when typing in search input', async () => {
      const user = userEvent.setup();
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search properties...');
      await user.type(searchInput, 'email');

      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.queryByText('age')).not.toBeInTheDocument();
      expect(screen.queryByText('birthDate')).not.toBeInTheDocument();
    });
  });

  describe('delete confirmation', () => {
    it('shows delete modal and confirms deletion', async () => {
      const user = userEvent.setup();
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });

      // Find delete buttons in table rows (Pencil, Trash2 per row)
      const actionButtons = screen.getAllByRole('button', { name: '' });
      const trashButtons = actionButtons.filter((btn) => btn.closest('td'));

      if (trashButtons.length >= 2) {
        await user.click(trashButtons[1]); // first row's delete button
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Property')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      await waitFor(() => {
        expect(mockDeleteProperty).toHaveBeenCalled();
      });
    });

    it('cancels delete modal', async () => {
      const user = userEvent.setup();
      render(<PropertiesPage />);

      await waitFor(() => {
        expect(screen.getByText('email')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: '' });
      const trashButtons = actionButtons.filter((btn) => btn.closest('td'));
      if (trashButtons.length >= 2) {
        await user.click(trashButtons[1]);
      }

      await waitFor(() => {
        expect(screen.getByText('Delete Property')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockDeleteProperty).not.toHaveBeenCalled();
      });
    });
  });
});

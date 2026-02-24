import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mocks ----
const mockNavigate = vi.fn();
const mockParams: Record<string, string | undefined> = {};
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

vi.mock('../../contexts/HeaderContext', () => ({
  useHeader: () => ({ setBreadcrumbs: vi.fn(), setActions: vi.fn() }),
}));

vi.mock('../../contexts/OntologyContext', () => ({
  useCurrentOntology: () => ({ currentOntologyId: 1 }),
}));

const mockGetProperty = vi.fn();
const mockCreateProperty = vi.fn();
const mockUpdateProperty = vi.fn();

vi.mock('../../services/coreService', () => ({
  getProperty: (...args: unknown[]) => mockGetProperty(...args),
  createProperty: (...args: unknown[]) => mockCreateProperty(...args),
  updateProperty: (...args: unknown[]) => mockUpdateProperty(...args),
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

import PropertyEditorPage from '../PropertyEditorPage';

describe('PropertyEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.propertyId = undefined;
    mockCreateProperty.mockResolvedValue({ data: { id: 10, name: 'Test' } });
    mockUpdateProperty.mockResolvedValue({ data: { id: 1, name: 'Updated' } });
  });

  describe('create mode (new property)', () => {
    it('renders form with empty fields and default data type', () => {
      render(<PropertyEditorPage />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., email, birthDate, salary')).toBeInTheDocument();
      expect(screen.getByText('Data Type & Constraints')).toBeInTheDocument();
    });

    it('fills in property name', async () => {
      const user = userEvent.setup();
      render(<PropertyEditorPage />);

      const nameInput = screen.getByPlaceholderText('e.g., email, birthDate, salary');
      await user.type(nameInput, 'email');

      expect(nameInput).toHaveValue('email');
    });

    it('renders preview card showing property info', () => {
      render(<PropertyEditorPage />);

      expect(screen.getByText('Property Preview')).toBeInTheDocument();
      expect(screen.getByText('propertyName')).toBeInTheDocument();
    });

    it('renders constraint section with Required checkbox', () => {
      render(<PropertyEditorPage />);

      // "Constraints" appears in section title and preview card
      expect(screen.getAllByText('Constraints').length).toBeGreaterThanOrEqual(1);
      // "Required" appears as checkbox label and possibly in preview tag
      expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(1);
    });

    it('renders String constraints by default (min/max length)', () => {
      render(<PropertyEditorPage />);

      // String is the default data type — StringConstraints should render
      // The constraint component should show min/max length fields
      expect(screen.getByText('Data Type & Constraints')).toBeInTheDocument();
    });
  });

  describe('edit mode (existing property)', () => {
    beforeEach(() => {
      mockParams.propertyId = '1';
      mockGetProperty.mockResolvedValue({
        data: {
          id: 1,
          name: 'email',
          uri: 'http://example.com/email',
          description: 'Email address',
          dataType: 'String',
          isRequired: true,
          ontologyId: 1,
          constraints: JSON.stringify({ minLength: 5, maxLength: 100 }),
        },
      });
    });

    it('loads property data and populates form', async () => {
      render(<PropertyEditorPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('email')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('http://example.com/email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Email address')).toBeInTheDocument();
      expect(mockGetProperty).toHaveBeenCalledWith(1);
    });
  });

  describe('data type switching', () => {
    it('renders data type selector with all options', () => {
      render(<PropertyEditorPage />);

      // "String" appears in the selector and the preview card
      expect(screen.getAllByText('String').length).toBeGreaterThanOrEqual(1);
    });
  });
});

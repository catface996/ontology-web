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

const mockGetClass = vi.fn();
const mockCreateClass = vi.fn();
const mockUpdateClass = vi.fn();
const mockListClasses = vi.fn();
const mockListProperties = vi.fn();
const mockListRelations = vi.fn();
const mockListClassProperties = vi.fn();
const mockBindClassProperties = vi.fn();
const mockUnbindClassProperty = vi.fn();
const mockListClassRelations = vi.fn();
const mockBindClassRelations = vi.fn();
const mockUnbindClassRelation = vi.fn();

vi.mock('../../services/coreService', () => ({
  getClass: (...args: unknown[]) => mockGetClass(...args),
  createClass: (...args: unknown[]) => mockCreateClass(...args),
  updateClass: (...args: unknown[]) => mockUpdateClass(...args),
  listClasses: (...args: unknown[]) => mockListClasses(...args),
  listProperties: (...args: unknown[]) => mockListProperties(...args),
  listRelations: (...args: unknown[]) => mockListRelations(...args),
  listClassProperties: (...args: unknown[]) => mockListClassProperties(...args),
  bindClassProperties: (...args: unknown[]) => mockBindClassProperties(...args),
  unbindClassProperty: (...args: unknown[]) => mockUnbindClassProperty(...args),
  listClassRelations: (...args: unknown[]) => mockListClassRelations(...args),
  bindClassRelations: (...args: unknown[]) => mockBindClassRelations(...args),
  unbindClassRelation: (...args: unknown[]) => mockUnbindClassRelation(...args),
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

import ClassEditorPage from '../ClassEditorPage';

describe('ClassEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.classId = undefined;
    mockListClasses.mockResolvedValue({ data: [] });
    mockListProperties.mockResolvedValue({ data: [] });
    mockListRelations.mockResolvedValue({ data: [] });
    mockListClassProperties.mockResolvedValue({ data: [] });
    mockListClassRelations.mockResolvedValue({ data: [] });
    mockCreateClass.mockResolvedValue({ data: { id: 10, name: 'Test' } });
    mockUpdateClass.mockResolvedValue({ data: { id: 1, name: 'Updated' } });
  });

  describe('create mode (new class)', () => {
    it('renders add-new-class form with empty fields', () => {
      render(<ClassEditorPage />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Person, Organization, Product')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('http://ontology.example.com/Person')).toBeInTheDocument();
    });

    it('shows "Save the class first" message for properties and relations', () => {
      render(<ClassEditorPage />);

      expect(screen.getByText('Save the class first, then you can bind properties.')).toBeInTheDocument();
      expect(screen.getByText('Save the class first to see related relations')).toBeInTheDocument();
    });

    it('fills in form fields', async () => {
      const user = userEvent.setup();
      render(<ClassEditorPage />);

      const nameInput = screen.getByPlaceholderText('e.g., Person, Organization, Product');
      const uriInput = screen.getByPlaceholderText('http://ontology.example.com/Person');
      const descInput = screen.getByPlaceholderText('Describe the purpose and usage of this class...');

      await user.type(nameInput, 'Person');
      await user.type(uriInput, 'http://example.com/Person');
      await user.type(descInput, 'A human being');

      expect(nameInput).toHaveValue('Person');
      expect(uriInput).toHaveValue('http://example.com/Person');
      expect(descInput).toHaveValue('A human being');
    });

    it('renders the class preview with typed name', async () => {
      const user = userEvent.setup();
      render(<ClassEditorPage />);

      // Default preview text
      expect(screen.getByText('ClassName')).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText('e.g., Person, Organization, Product');
      await user.type(nameInput, 'Animal');

      expect(screen.getByText('Animal')).toBeInTheDocument();
    });
  });

  describe('edit mode (existing class)', () => {
    beforeEach(() => {
      mockParams.classId = '1';
      mockGetClass.mockResolvedValue({
        data: {
          id: 1,
          name: 'Person',
          uri: 'http://example.com/Person',
          description: 'A human being',
          ontologyId: 1,


        },
      });
    });

    it('loads class data and populates form fields', async () => {
      render(<ClassEditorPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Person')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('http://example.com/Person')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A human being')).toBeInTheDocument();
      expect(mockGetClass).toHaveBeenCalledWith(1);
    });

    it('loads bound properties and relations', async () => {
      mockListClassProperties.mockResolvedValue({
        data: [
          { propertyId: 10, propertyName: 'emailAddress', dataType: 'String', isRequired: true, isUnique: false },
        ],
      });
      mockListClassRelations.mockResolvedValue({
        data: [
          { relationId: 20, relationName: 'worksFor', domainClassName: 'Person', rangeClassName: 'Organization' },
        ],
      });

      render(<ClassEditorPage />);

      await waitFor(() => {
        // emailAddress appears in bound list and preview
        expect(screen.getAllByText('emailAddress').length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getAllByText('worksFor').length).toBeGreaterThanOrEqual(1);
    });
  });
});

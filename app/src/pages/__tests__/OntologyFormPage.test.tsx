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

const mockGetOntology = vi.fn();
const mockCreateOntology = vi.fn();
const mockUpdateOntology = vi.fn();

vi.mock('../../services/coreService', () => ({
  getOntology: (...args: unknown[]) => mockGetOntology(...args),
  createOntology: (...args: unknown[]) => mockCreateOntology(...args),
  updateOntology: (...args: unknown[]) => mockUpdateOntology(...args),
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

import OntologyFormPage from '../OntologyFormPage';

describe('OntologyFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = undefined;
    mockCreateOntology.mockResolvedValue({ data: { id: 1, name: 'Test' } });
    mockUpdateOntology.mockResolvedValue({ data: { id: 1, name: 'Updated' } });
  });

  describe('create mode (new ontology)', () => {
    it('renders form sections', () => {
      render(<OntologyFormPage />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Namespaces')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders empty form inputs with correct placeholders', () => {
      render(<OntologyFormPage />);

      expect(screen.getByPlaceholderText('Enter ontology name...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('http://example.com/ontology/')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the purpose and scope of this ontology...')).toBeInTheDocument();
    });

    it('renders save button with "Save Ontology" text', () => {
      render(<OntologyFormPage />);

      expect(screen.getByText('Save Ontology')).toBeInTheDocument();
    });

    it('renders Import from File section for new ontology', () => {
      render(<OntologyFormPage />);

      expect(screen.getByText('Import from File')).toBeInTheDocument();
    });

    it('fills in form fields', async () => {
      const user = userEvent.setup();
      render(<OntologyFormPage />);

      const nameInput = screen.getByPlaceholderText('Enter ontology name...');
      const uriInput = screen.getByPlaceholderText('http://example.com/ontology/');

      await user.type(nameInput, 'MyOntology');
      await user.type(uriInput, 'http://example.com/my-ontology/');

      expect(nameInput).toHaveValue('MyOntology');
      expect(uriInput).toHaveValue('http://example.com/my-ontology/');
    });

    it('renders default namespaces (owl, rdfs)', () => {
      render(<OntologyFormPage />);

      expect(screen.getByDisplayValue('owl:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('rdfs:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('http://www.w3.org/2002/07/owl#')).toBeInTheDocument();
    });

    it('renders settings toggles (Enable Reasoning, Auto Versioning)', () => {
      render(<OntologyFormPage />);

      expect(screen.getByText('Enable Reasoning')).toBeInTheDocument();
      expect(screen.getByText('Auto Versioning')).toBeInTheDocument();
    });

    it('navigates to /ontologies on Cancel click', async () => {
      const user = userEvent.setup();
      render(<OntologyFormPage />);

      await user.click(screen.getByText('Cancel'));

      expect(mockNavigate).toHaveBeenCalledWith('/ontologies');
    });
  });

  describe('edit mode (existing ontology)', () => {
    beforeEach(() => {
      mockParams.id = '1';
      mockGetOntology.mockResolvedValue({
        data: {
          id: 1,
          name: 'Enterprise',
          uri: 'http://example.com/enterprise/',
          version: 'v2.1.0',
          status: 'PUBLISHED',
          description: 'Enterprise ontology',
        },
      });
    });

    it('loads ontology data and populates form', async () => {
      render(<OntologyFormPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Enterprise')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('http://example.com/enterprise/')).toBeInTheDocument();
      expect(screen.getByDisplayValue('v2.1.0')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Enterprise ontology')).toBeInTheDocument();
      expect(mockGetOntology).toHaveBeenCalledWith(1);
    });

    it('renders save button with "Save Changes" text', async () => {
      render(<OntologyFormPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Enterprise')).toBeInTheDocument();
      });

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('does not render Import from File section in edit mode', async () => {
      render(<OntologyFormPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Enterprise')).toBeInTheDocument();
      });

      expect(screen.queryByText('Import from File')).not.toBeInTheDocument();
    });
  });

  describe('namespace management', () => {
    it('adds a new namespace row when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<OntologyFormPage />);

      // Initially 2 namespace rows (owl, rdfs)
      const initialPrefixInputs = screen.getAllByPlaceholderText('prefix:');
      expect(initialPrefixInputs).toHaveLength(2);

      await user.click(screen.getByText('Add'));

      const updatedPrefixInputs = screen.getAllByPlaceholderText('prefix:');
      expect(updatedPrefixInputs).toHaveLength(3);
    });
  });
});

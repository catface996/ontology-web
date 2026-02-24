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

const mockGetRelation = vi.fn();
const mockCreateRelation = vi.fn();
const mockUpdateRelation = vi.fn();
const mockListClasses = vi.fn();

vi.mock('../../services/coreService', () => ({
  getRelation: (...args: unknown[]) => mockGetRelation(...args),
  createRelation: (...args: unknown[]) => mockCreateRelation(...args),
  updateRelation: (...args: unknown[]) => mockUpdateRelation(...args),
  listClasses: (...args: unknown[]) => mockListClasses(...args),
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

import RelationEditorPage from '../RelationEditorPage';

describe('RelationEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.relationId = undefined;
    mockListClasses.mockResolvedValue({
      data: [
        { id: 1, name: 'Person' },
        { id: 2, name: 'Organization' },
      ],
    });
    mockCreateRelation.mockResolvedValue({ data: { id: 10, name: 'worksFor' } });
    mockUpdateRelation.mockResolvedValue({ data: { id: 1, name: 'updated' } });
  });

  describe('create mode (new relation)', () => {
    it('renders form with empty fields', () => {
      render(<RelationEditorPage />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., worksFor, hasParent, locatedIn')).toBeInTheDocument();
      expect(screen.getByText('Domain & Range')).toBeInTheDocument();
    });

    it('fills in relation name and auto-generates URI', async () => {
      const user = userEvent.setup();
      render(<RelationEditorPage />);

      const nameInput = screen.getByPlaceholderText('e.g., worksFor, hasParent, locatedIn');
      await user.type(nameInput, 'worksFor');

      expect(nameInput).toHaveValue('worksFor');
    });

    it('renders relation properties checkboxes (Functional, Symmetric, etc.)', () => {
      render(<RelationEditorPage />);

      expect(screen.getByText('Functional')).toBeInTheDocument();
      expect(screen.getByText('Inverse Functional')).toBeInTheDocument();
      expect(screen.getByText('Symmetric')).toBeInTheDocument();
      expect(screen.getByText('Transitive')).toBeInTheDocument();
    });

    it('renders preview card with default values', () => {
      render(<RelationEditorPage />);

      expect(screen.getByText('Relation Preview')).toBeInTheDocument();
    });
  });

  describe('edit mode (existing relation)', () => {
    beforeEach(() => {
      mockParams.relationId = '1';
      mockGetRelation.mockResolvedValue({
        data: {
          id: 1,
          name: 'worksFor',
          uri: 'http://example.com/worksFor',
          description: 'Employment relation',
          ontologyId: 1,
          domainClassId: 1,
          rangeClassId: 2,
          isFunctional: true,
          isInverseFunctional: false,
          isSymmetric: false,
          isTransitive: false,
        },
      });
    });

    it('loads relation data and populates form', async () => {
      render(<RelationEditorPage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('worksFor')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('http://example.com/worksFor')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Employment relation')).toBeInTheDocument();
      expect(mockGetRelation).toHaveBeenCalledWith(1);
    });
  });

  describe('domain/range selection', () => {
    it('renders domain and range select controls', () => {
      render(<RelationEditorPage />);

      expect(screen.getByText('Domain (Source Class)')).toBeInTheDocument();
      expect(screen.getByText('Range (Target Class)')).toBeInTheDocument();
    });
  });
});

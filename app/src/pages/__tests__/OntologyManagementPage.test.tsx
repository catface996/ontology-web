import { render, screen, act } from '@testing-library/react';
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

const mockSetCurrentOntology = vi.fn();
vi.mock('../../contexts/OntologyContext', () => ({
  useCurrentOntology: () => ({ setCurrentOntology: mockSetCurrentOntology }),
}));

const mockListOntologies = vi.fn();
vi.mock('../../services/coreService', () => ({
  listOntologies: (...args: unknown[]) => mockListOntologies(...args),
}));

import OntologyManagementPage from '../OntologyManagementPage';

// ---- Fixtures ----
const mockOntologies = [
  {
    id: 1, name: 'Enterprise', description: 'Enterprise knowledge graph',
    status: 'PUBLISHED', version: 'v2.1.0',
    classCount: 24, relationCount: 156, propertyCount: 89, instanceCount: 1200,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2, name: 'Healthcare', description: 'Medical terminologies',
    status: 'PUBLISHED', version: 'v1.8.3',
    classCount: 18, relationCount: 89, propertyCount: 645, instanceCount: 2800,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3, name: 'Finance', description: 'Financial instruments and risk models',
    status: 'DRAFT', version: 'v0.9.2',
    classCount: 31, relationCount: 203, propertyCount: 127, instanceCount: 956,
    updatedAt: new Date().toISOString(),
  },
];

/** Render and wait for the async data load to finish */
async function renderAndWaitForLoad() {
  await act(async () => {
    render(<OntologyManagementPage />);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('OntologyManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListOntologies.mockResolvedValue({ data: mockOntologies });
  });

  describe('card list loading', () => {
    it('renders page title and description', async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText('Ontology Management')).toBeInTheDocument();
      expect(screen.getByText(/Create, manage and explore your ontologies/)).toBeInTheDocument();
    });

    it('renders ontology cards from API data', async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });

    it('renders status tags (Published / Draft)', async () => {
      await renderAndWaitForLoad();

      expect(screen.getAllByText('Published').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
    });

    it('shows empty state when API returns no data', async () => {
      mockListOntologies.mockResolvedValue({ data: null });
      await renderAndWaitForLoad();

      expect(screen.getByText('No ontologies found')).toBeInTheDocument();
    });

    it('renders New Ontology button', async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText('New Ontology')).toBeInTheDocument();
    });
  });

  describe('search filtering', () => {
    it('filters ontology cards by name when typing in search', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      const searchInput = screen.getByPlaceholderText('Search ontologies...');
      await user.type(searchInput, 'health');

      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      expect(screen.queryByText('Enterprise')).not.toBeInTheDocument();
      expect(screen.queryByText('Finance')).not.toBeInTheDocument();
    });

    it('filters by description text', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      const searchInput = screen.getByPlaceholderText('Search ontologies...');
      await user.type(searchInput, 'financial');

      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.queryByText('Enterprise')).not.toBeInTheDocument();
    });
  });

  describe('status filter tabs', () => {
    it('renders All, Published, and Draft filter tabs', async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getAllByText('Published').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
    });

    it('filters by Published status', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      // Find the Published filter tab (in the filter bar)
      const filterTabs = screen.getAllByText('Published');
      await user.click(filterTabs[0]);

      // Published: Enterprise, Healthcare
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      // Draft items should be hidden
      expect(screen.queryByText('Finance')).not.toBeInTheDocument();
    });
  });

  describe('card click navigation', () => {
    it('navigates to ontology detail and sets current ontology on card click', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      await user.click(screen.getByText('Enterprise'));

      expect(mockSetCurrentOntology).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: 'Enterprise' }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/ontologies/1');
    });

    it('navigates to new ontology page when New Ontology button is clicked', async () => {
      const user = userEvent.setup();
      await renderAndWaitForLoad();

      await user.click(screen.getByText('New Ontology'));

      expect(mockNavigate).toHaveBeenCalledWith('/ontologies/new');
    });
  });
});

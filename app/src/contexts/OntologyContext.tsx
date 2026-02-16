import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

const STORAGE_KEY = 'current-ontology-id';
const STORAGE_INFO_KEY = 'current-ontology-info';

export interface OntologyInfo {
  id: number;
  name: string;
  version: string;
  status: string;
}

interface OntologyContextValue {
  /** Currently selected ontology ID, or null if none selected */
  currentOntologyId: number | null;
  /** Full info for the currently selected ontology */
  currentOntology: OntologyInfo | null;
  /** Set the current ontology (persisted to localStorage) */
  setCurrentOntologyId: (id: number | null) => void;
  /** Set the current ontology with full info */
  setCurrentOntology: (info: OntologyInfo | null) => void;
}

const OntologyContext = createContext<OntologyContextValue>({
  currentOntologyId: null,
  currentOntology: null,
  setCurrentOntologyId: () => {},
  setCurrentOntology: () => {},
});

function loadStoredInfo(): OntologyInfo | null {
  const raw = localStorage.getItem(STORAGE_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OntologyInfo;
  } catch {
    return null;
  }
}

export function OntologyProvider({ children }: { children: ReactNode }) {
  const [currentOntology, setCurrentOntologyState] = useState<OntologyInfo | null>(loadStoredInfo);

  const currentOntologyId = currentOntology?.id ?? null;

  const setCurrentOntology = useCallback((info: OntologyInfo | null) => {
    setCurrentOntologyState(info);
    if (info) {
      localStorage.setItem(STORAGE_KEY, String(info.id));
      localStorage.setItem(STORAGE_INFO_KEY, JSON.stringify(info));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_INFO_KEY);
    }
  }, []);

  // Backward-compatible: set by ID only (clears full info if no match)
  const setCurrentOntologyId = useCallback((id: number | null) => {
    if (id === null) {
      setCurrentOntology(null);
    } else {
      // Preserve existing info if same id, otherwise store minimal info
      setCurrentOntologyState((prev) => {
        if (prev && prev.id === id) return prev;
        const minimal: OntologyInfo = { id, name: '', version: '', status: '' };
        localStorage.setItem(STORAGE_KEY, String(id));
        localStorage.setItem(STORAGE_INFO_KEY, JSON.stringify(minimal));
        return minimal;
      });
    }
  }, [setCurrentOntology]);

  const value = useMemo(() => ({
    currentOntologyId,
    currentOntology,
    setCurrentOntologyId,
    setCurrentOntology,
  }), [currentOntologyId, currentOntology, setCurrentOntologyId, setCurrentOntology]);

  return (
    <OntologyContext.Provider value={value}>
      {children}
    </OntologyContext.Provider>
  );
}

export function useCurrentOntology() {
  return useContext(OntologyContext);
}

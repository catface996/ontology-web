export interface TopologyPreset {
  id: string;
  name: string;
  classIds: number[];
  ontologyId: number;
  createdAt: string;
}

const STORAGE_KEY = 'topology_presets';

function getAllPresets(): TopologyPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAllPresets(presets: TopologyPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function loadPresets(ontologyId: number): TopologyPreset[] {
  return getAllPresets().filter((p) => p.ontologyId === ontologyId);
}

export function savePreset(preset: TopologyPreset): void {
  const all = getAllPresets();
  const idx = all.findIndex((p) => p.id === preset.id);
  if (idx >= 0) {
    all[idx] = preset;
  } else {
    all.push(preset);
  }
  setAllPresets(all);
}

export function deletePreset(id: string): void {
  setAllPresets(getAllPresets().filter((p) => p.id !== id));
}

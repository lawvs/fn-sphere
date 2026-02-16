import {
  countNumberOfRules,
  createFilterGroup,
  createSingleFilter,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
  type FilterGroup,
} from "@fn-sphere/filter";
import { useCallback, useState } from "react";
import { z } from "zod";

const PRESETS_KEY = "filter-presets";
const ACTIVE_KEY = "filter-active-preset";

const schema = z.object({
  name: z.string().describe("Name"),
  status: z
    .union([z.literal("active"), z.literal("inactive"), z.literal("archived")])
    .describe("Status"),
  priority: z.number().describe("Priority"),
});

const emptyRule = createFilterGroup({
  op: "and",
  conditions: [createSingleFilter()],
});

type Preset = { id: string; name: string; rule: FilterGroup };

function loadPresets(): Preset[] {
  try {
    const saved = localStorage.getItem(PRESETS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: Preset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function loadActivePreset(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

function saveActivePreset(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function PresetCollection() {
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [activePreset, setActivePreset] = useState<string | null>(
    loadActivePreset,
  );

  const { context, filterRule, reset } = useFilterSphere({
    schema,
    defaultRule: () => {
      const activeId = loadActivePreset();
      if (activeId) {
        const found = loadPresets().find((p) => p.id === activeId);
        if (found) return found.rule;
      }
      return emptyRule;
    },
  });

  const handleSave = useCallback(() => {
    const name = prompt("Preset name:");
    if (!name?.trim()) return;
    const id = Math.random().toString(36).slice(2);
    const next = [...presets, { id, name, rule: filterRule }];
    setPresets(next);
    savePresets(next);
    setActivePreset(id);
    saveActivePreset(id);
  }, [presets, filterRule]);

  const handleSwitch = useCallback(
    (id: string) => {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;
      reset(preset.rule);
      setActivePreset(id);
      saveActivePreset(id);
    },
    [presets, reset],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = presets.filter((p) => p.id !== id);
      setPresets(next);
      savePresets(next);
      if (activePreset === id) {
        setActivePreset(null);
        saveActivePreset(null);
      }
    },
    [presets, activePreset],
  );

  const handleClear = useCallback(() => {
    reset(emptyRule);
    setActivePreset(null);
    saveActivePreset(null);
  }, [reset]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => (
          <div key={preset.id} className="flex items-center gap-1">
            <button
              onClick={() => handleSwitch(preset.id)}
              className={`cursor-pointer rounded border px-3 py-1 ${
                activePreset === preset.id
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-400 bg-transparent"
              }`}
            >
              {preset.name}
              {countNumberOfRules(preset.rule) > 0 &&
                `(${countNumberOfRules(preset.rule)})`}
            </button>
            <button
              onClick={() => handleDelete(preset.id)}
              className="cursor-pointer rounded border border-gray-400 bg-transparent px-1.5 py-1 text-xs"
            >
              x
            </button>
          </div>
        ))}
        <button
          onClick={handleSave}
          className="cursor-pointer rounded border border-gray-400 bg-transparent px-3 py-1"
        >
          + Save Preset
        </button>
        <button
          onClick={handleClear}
          className="cursor-pointer rounded border border-gray-400 bg-transparent px-3 py-1"
        >
          Clear
        </button>
      </div>
      <FilterSphereProvider context={context}>
        <FilterBuilder />
      </FilterSphereProvider>
    </div>
  );
}

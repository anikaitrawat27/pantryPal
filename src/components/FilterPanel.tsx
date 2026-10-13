"use client";

import { COURSES, CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import { DIET_LABELS, DIETS } from "@/lib/diet";
import type { FilterState } from "@/lib/filter";
import { COURSE_LABELS, CUISINE_LABELS, EQUIPMENT_LABELS, MEAL_LABELS } from "@/lib/labels";
import styles from "./FilterPanel.module.css";
import ui from "./ui.module.css";

type ListKey = "courses" | "meals" | "cuisines" | "diets" | "tools";

interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
}

const TIME_OPTIONS = [15, 30, 60] as const;
const LEVEL_OPTIONS = [
  [1, "Easy only"],
  [2, "Easy or medium"],
] as const;
const TOOLS = EQUIPMENT.filter((e) => e !== "no-cook");

function ChipGroup<T extends string>({
  legend,
  options,
  labels,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly T[];
  labels: Record<T, string>;
  selected: readonly T[];
  onToggle: (v: T) => void;
}) {
  return (
    <fieldset className={styles.group}>
      <legend>{legend}</legend>
      <div className={styles.chips}>
        {options.map((o) => (
          <button key={o} type="button" className={ui.chip} aria-pressed={selected.includes(o)} onClick={() => onToggle(o)}>
            {labels[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FilterPanel({ filters, onChange }: Props) {
  const toggle = <K extends ListKey>(key: K, value: FilterState[K][number]) => {
    const list = filters[key] as string[];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as Partial<FilterState>);
  };

  return (
    <div className={styles.panel}>
      <ChipGroup legend="Course" options={COURSES} labels={COURSE_LABELS} selected={filters.courses} onToggle={(v) => toggle("courses", v)} />
      <ChipGroup legend="Meal" options={MEALS} labels={MEAL_LABELS} selected={filters.meals} onToggle={(v) => toggle("meals", v)} />
      <ChipGroup legend="Diet" options={DIETS} labels={DIET_LABELS} selected={filters.diets} onToggle={(v) => toggle("diets", v)} />
      <ChipGroup
        legend="Tools I have"
        options={TOOLS}
        labels={EQUIPMENT_LABELS}
        selected={filters.tools}
        onToggle={(v) => toggle("tools", v)}
      />

      <fieldset className={styles.group}>
        <legend>Total time</legend>
        <div className={styles.chips}>
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              className={ui.chip}
              aria-pressed={filters.maxTime === t}
              onClick={() => onChange({ maxTime: filters.maxTime === t ? undefined : t })}
            >
              {t === 60 ? "Under 1 hr" : `Under ${t} min`}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Difficulty</legend>
        <div className={styles.chips}>
          {LEVEL_OPTIONS.map(([level, label]) => (
            <button
              key={level}
              type="button"
              className={ui.chip}
              aria-pressed={filters.maxLevel === level}
              onClick={() => onChange({ maxLevel: filters.maxLevel === level ? undefined : level })}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.toggle}>
        <input type="checkbox" checked={filters.noExtras} onChange={(e) => onChange({ noExtras: e.target.checked })} />
        <span>
          Pantry basics only
          <small>Hide recipes that need extras like cumin or soy sauce</small>
        </span>
      </label>

      <ChipGroup legend="Cuisine" options={CUISINES} labels={CUISINE_LABELS} selected={filters.cuisines} onToggle={(v) => toggle("cuisines", v)} />
    </div>
  );
}

"use client";

import { CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import { useDict } from "@/i18n/client";
import { DIETS } from "@/lib/diet";
import { COURSE_FILTERS, type FilterState } from "@/lib/filter";
import styles from "./FilterPanel.module.css";
import ui from "../ui.module.css";

type ListKey = "courses" | "meals" | "cuisines" | "diets" | "tools";

interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
}

const TIME_OPTIONS = [15, 30, 60] as const;
const COST_OPTIONS = [1, 2] as const;
const LEVEL_OPTIONS = [1, 2] as const;
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
          <button
            key={o}
            type="button"
            className={ui.chip}
            aria-pressed={selected.includes(o)}
            onClick={() => onToggle(o)}
          >
            {labels[o]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function FilterPanel({ filters, onChange }: Props) {
  const d = useDict();
  const t = d.filters;
  const toggle = <K extends ListKey>(key: K, value: FilterState[K][number]) => {
    const list = filters[key] as string[];
    onChange({
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    } as Partial<FilterState>);
  };

  return (
    <div className={styles.panel}>
      <ChipGroup
        legend={t.course}
        options={COURSE_FILTERS}
        labels={d.courses}
        selected={filters.courses}
        onToggle={(v) => toggle("courses", v)}
      />
      <ChipGroup
        legend={t.meal}
        options={MEALS}
        labels={d.meals}
        selected={filters.meals}
        onToggle={(v) => toggle("meals", v)}
      />
      <ChipGroup
        legend={t.diet}
        options={DIETS}
        labels={d.diets}
        selected={filters.diets}
        onToggle={(v) => toggle("diets", v)}
      />
      <ChipGroup
        legend={t.tools}
        options={TOOLS}
        labels={d.equipment}
        selected={filters.tools}
        onToggle={(v) => toggle("tools", v)}
      />

      <fieldset className={styles.group}>
        <legend>{t.time}</legend>
        <div className={styles.chips}>
          {TIME_OPTIONS.map((min) => (
            <button
              key={min}
              type="button"
              className={ui.chip}
              aria-pressed={filters.maxTime === min}
              onClick={() => onChange({ maxTime: filters.maxTime === min ? undefined : min })}
            >
              {t.under(min)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t.cost}</legend>
        <div className={styles.chips}>
          {COST_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              className={ui.chip}
              aria-pressed={filters.maxCost === c}
              onClick={() => onChange({ maxCost: filters.maxCost === c ? undefined : c })}
            >
              {t.costUnder(c)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t.difficulty}</legend>
        <div className={styles.chips}>
          {LEVEL_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              className={ui.chip}
              aria-pressed={filters.maxLevel === level}
              onClick={() => onChange({ maxLevel: filters.maxLevel === level ? undefined : level })}
            >
              {level === 1 ? t.easyOnly : t.easyMedium}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={styles.toggle}>
        <input type="checkbox" checked={filters.noExtras} onChange={(e) => onChange({ noExtras: e.target.checked })} />
        <span>
          {t.basicsOnly}
          <small>{t.basicsHint}</small>
        </span>
      </label>

      <ChipGroup
        legend={t.cuisine}
        options={CUISINES}
        labels={d.cuisines}
        selected={filters.cuisines}
        onToggle={(v) => toggle("cuisines", v)}
      />
    </div>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { getIngredient } from "@/data/pantry";
import { searchIngredients } from "@/lib/match";
import styles from "./IngredientInput.module.css";

interface Props {
  value: readonly string[];
  onChange: (ids: string[]) => void;
  label: string;
  placeholder?: string;
}

/**
 * Chip input with ingredient autocomplete (ARIA combobox). Typing a comma-separated
 * list such as "rice, eggs, peas" and pressing Enter adds the best match for each.
 */
export function IngredientInput({ value, onChange, label, placeholder = "Type an ingredient…" }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const lastToken = text.split(",").pop() ?? "";
  const options = useMemo(
    () => searchIngredients(lastToken).filter((i) => !value.includes(i.id)),
    [lastToken, value],
  );
  const showList = open && options.length > 0 && lastToken.trim().length > 0;

  const add = (ids: string[]) => {
    const next = [...value];
    for (const i of ids) if (!next.includes(i)) next.push(i);
    onChange(next);
    setText("");
    setActive(0);
  };

  const commitText = () => {
    const tokens = text.split(",").map((t) => t.trim()).filter(Boolean);
    const ids = tokens.flatMap((t, idx) => {
      // The token being typed uses the highlighted suggestion.
      if (idx === tokens.length - 1 && showList) return [options[active].id];
      const best = searchIngredients(t, 1)[0];
      return best ? [best.id] : [];
    });
    if (ids.length) add(ids);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      if (text.trim()) {
        e.preventDefault();
        commitText();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.box}>
        <ul className={styles.chips} aria-label="Selected ingredients">
          {value.map((v) => (
            <li key={v} className={styles.chip}>
              {getIngredient(v).name}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${getIngredient(v).name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          id={id}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className={styles.input}
          value={text}
          placeholder={value.length ? "Add another…" : placeholder}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
      </div>
      <ul id={listId} role="listbox" className={styles.list} hidden={!showList} aria-label="Ingredient suggestions">
        {showList &&
          options.map((o, i) => (
            <li
              key={o.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={styles.option}
              // mousedown keeps focus in the input so blur does not close the list first.
              onMouseDown={(e) => {
                e.preventDefault();
                const done = text.split(",").slice(0, -1).map((t) => t.trim()).filter(Boolean);
                const earlier = done.flatMap((t) => searchIngredients(t, 1).map((x) => x.id));
                add([...earlier, o.id]);
              }}
              onMouseEnter={() => setActive(i)}
            >
              {o.name}
              {o.tier === "extra" && <span className={styles.extra}>extra</span>}
            </li>
          ))}
      </ul>
    </div>
  );
}

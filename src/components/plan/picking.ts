/**
 * Two ways to put a recipe on the plan, sharing one model:
 * - drag a shelf recipe or a planned meal onto a slot (mouse), or
 * - tap it to "pick it up", then tap "Place here" on a slot (touch and keyboard).
 */
export type Picked = { kind: "recipe"; slug: string } | { kind: "entry"; id: string };

const DRAG_TYPE = "application/x-pantrypal";

/** Props that make an element draggable as `picked`. */
export function draggable(picked: Picked) {
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(picked));
      e.dataTransfer.effectAllowed = "copyMove";
    },
  };
}

/** What was dropped, or null if the drag did not come from this page. */
export function readDrop(e: React.DragEvent): Picked | null {
  try {
    return JSON.parse(e.dataTransfer.getData(DRAG_TYPE)) as Picked;
  } catch {
    return null;
  }
}

/** Whether `target` is the thing currently picked up. */
export function isPicked(picked: Picked | null, target: Picked): boolean {
  if (picked === null) return false;
  if (picked.kind === "recipe" && target.kind === "recipe") return picked.slug === target.slug;
  if (picked.kind === "entry" && target.kind === "entry") return picked.id === target.id;
  return false;
}

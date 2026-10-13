import { getIngredient, pluralName } from "@/data/pantry";
import type { Unit } from "@/data/schema";
import type { Lang } from "./config";
import { INGREDIENTS_ES } from "./es/ingredients";

/** Ingredient name in the given language, singular. */
export function ingredientName(id: string, lang: Lang): string {
  return lang === "es" ? (INGREDIENTS_ES[id]?.name ?? getIngredient(id).name) : getIngredient(id).name;
}

/** Plural name, for counted items. */
export function ingredientPlural(id: string, lang: Lang): string {
  if (lang === "es") {
    const es = INGREDIENTS_ES[id];
    return es?.plural ?? es?.name ?? pluralName(getIngredient(id));
  }
  return pluralName(getIngredient(id));
}

/** Name used after a can unit: "1 can corn", "1 lata de maíz". */
export function ingredientCanName(id: string, lang: Lang): string {
  if (lang === "es") return INGREDIENTS_ES[id]?.short ?? ingredientName(id, "es");
  return getIngredient(id).name.replace(/^canned /, "");
}

/** Every searchable name for an ingredient, in both languages. */
export function ingredientSearchNames(id: string): string[] {
  const ing = getIngredient(id);
  const es = INGREDIENTS_ES[id];
  return [ing.name, ...ing.aliases, ...(es ? [es.name, ...(es.aliases ?? [])] : [])];
}

const UNITS: Record<Lang, Record<Unit, [singular: string, plural: string]>> = {
  en: {
    tsp: ["tsp", "tsp"],
    tbsp: ["tbsp", "tbsp"],
    cup: ["cup", "cups"],
    oz: ["oz", "oz"],
    lb: ["lb", "lb"],
    can: ["can", "cans"],
    slice: ["slice", "slices"],
    clove: ["clove", "cloves"],
    link: ["link", "links"],
    stick: ["stick", "sticks"],
    packet: ["packet", "packets"],
    pinch: ["pinch", "pinches"],
    dash: ["dash", "dashes"],
    splash: ["splash", "splashes"],
    handful: ["handful", "handfuls"],
    leaf: ["leaf", "leaves"],
  },
  es: {
    tsp: ["cucharadita", "cucharaditas"],
    tbsp: ["cucharada", "cucharadas"],
    cup: ["taza", "tazas"],
    oz: ["oz", "oz"],
    lb: ["lb", "lb"],
    can: ["lata", "latas"],
    slice: ["rebanada", "rebanadas"],
    clove: ["diente", "dientes"],
    link: ["pieza", "piezas"],
    stick: ["barra", "barras"],
    packet: ["paquete", "paquetes"],
    pinch: ["pizca", "pizcas"],
    dash: ["toque", "toques"],
    splash: ["chorrito", "chorritos"],
    handful: ["puñado", "puñados"],
    leaf: ["hoja", "hojas"],
  },
};

export function unitName(unit: Unit, qty: number, lang: Lang): string {
  const [one, many] = UNITS[lang][unit];
  return qty > 1 ? many : one;
}

/** Joins an amount and a name: "2 cups milk" or "2 tazas de leche". */
export function joinAmount(amount: string, name: string, lang: Lang): string {
  return lang === "es" ? `${amount} de ${name}` : `${amount} ${name}`;
}

export function toTaste(name: string, lang: Lang): string {
  return lang === "es" ? `${name}, al gusto` : `${name}, to taste`;
}

const CONTAINERS_ES: Record<string, string> = {
  bag: "bolsa",
  can: "lata",
  box: "caja",
  jar: "frasco",
  bottle: "botella",
  carton: "cartón",
  tub: "bote",
  canister: "bote",
  tin: "lata",
  pack: "paquete",
  block: "barra",
  loaf: "pan de caja",
  packet: "paquete",
};

const FIXED_LABELS_ES: Record<string, string> = {
  "1 dozen": "1 docena",
  "1 gallon": "1 galón",
  "1 pint": "1 pinta",
  "1 lb": "1 lb",
  "8 oz": "8 oz",
  "1 head": "1 cabeza",
  "1 pear": "1 pera",
  "1 pepper": "1 pimiento",
  "bunch of 6": "racimo de 6",
  "pack of 8": "paquete de 8",
  "pack of 10": "paquete de 10",
  "can of 8": "lata de 8",
};

/** Translates a package label such as "15 oz can" to "lata de 15 oz". */
export function packLabel(label: string, lang: Lang): string {
  if (lang === "en") return label;
  if (label in FIXED_LABELS_ES) return FIXED_LABELS_ES[label];
  const m = label.match(/^([\d.]+ (?:oz|lb|fl oz)) (\w+)$/);
  if (m && CONTAINERS_ES[m[2]]) return `${CONTAINERS_ES[m[2]]} de ${m[1]}`;
  return label;
}

const SUB_NOTES_ES: Record<string, string> = {
  "Use a little less oil than butter.": "Use un poco menos de aceite que de mantequilla.",
  "Whisk with an equal amount of water.": "Bátalo con la misma cantidad de agua.",
  "Soften and thin with a splash of milk.": "Suavícelo y aclárelo con un chorrito de leche.",
  "The result is looser and tangier.": "Queda más suelto y más ácido.",
  "Tangier and lighter.": "Más ácido y más ligero.",
  "Adds fruit flavor.": "Le da sabor a fruta.",
  "Add a pinch of salt and sugar.": "Agregue una pizca de sal y de azúcar.",
  "Mash or blend for a smoother sauce.": "Macháquelo o licúelo para una salsa más suave.",
  "Add an extra pinch of salt and a little garlic-ginger paste.": "Agregue otra pizca de sal y un poco de pasta de ajo y jengibre.",
  "Sharper, so start with less.": "Es más fuerte; empiece con menos.",
  "Finely shredded.": "Finamente rallado.",
  "Cut each slice into rounds with a small glass.": "Corte cada rebanada en círculos con un vaso pequeño.",
  "Dice it small.": "Píquelo en cubitos.",
  "Use large carrots, sliced into thin coins.": "Use zanahorias grandes, cortadas en rodajas delgadas.",
  "Shredded. The crisps come out softer and oilier.": "Rallado. Las tostadas quedan más suaves y grasosas.",
  "Lightly crushed. The cookies come out crunchier.": "Ligeramente triturado. Las galletas quedan más crujientes.",
};

/** Swap notes are short English sentences; Spanish pages show the translation when one exists. */
export function subNote(note: string, lang: Lang): string {
  return lang === "es" ? (SUB_NOTES_ES[note] ?? note) : note;
}

/** For tests: whether a Spanish translation exists for a note or package label. */
export const hasSubNoteEs = (note: string) => note in SUB_NOTES_ES;
export const hasPackLabelEs = (label: string) => label in FIXED_LABELS_ES || packLabel(label, "es") !== label;

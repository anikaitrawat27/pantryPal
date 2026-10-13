/**
 * Approximate weights, nutrition, and prices for every pantry ingredient.
 *
 * These are estimates for planning, not lab values. Nutrition is per 100 g of the
 * ingredient as measured in recipes (dry pasta and rice, drained canned beans and
 * meat, raw meat). Prices are typical U.S. grocery prices for a common package size.
 */

/** Grams in one of each unit. `cup` also defines tsp, tbsp, pinch, dash, and splash. `each` is a counted item with no unit. */
export type GramUnit = "cup" | "each" | "can" | "slice" | "clove" | "stick" | "packet" | "handful" | "leaf";

export interface IngredientFacts {
  kcal: number;
  protein: number;
  fiber: number;
  grams: Partial<Record<GramUnit, number>>;
  /** For grains measured cooked: grams of one cooked cup, and how many times heavier cooked is than dry. */
  cooked?: { cupGrams: number; yield: number };
  /** Typical package: price in U.S. dollars, net grams (drained for canned beans, meat, and vegetables), and a label. */
  pack?: { usd: number; grams: number; label: string };
}

type Row = [
  kcal: number,
  protein: number,
  fiber: number,
  grams: IngredientFacts["grams"],
  pack?: [number, number, string],
];

const ROWS: Record<string, Row> = {
  // Produce
  apple: [52, 0.3, 2.4, { each: 182, cup: 125 }, [4.5, 1361, "3 lb bag"]],
  pear: [57, 0.4, 3.1, { each: 178, cup: 140 }, [0.9, 178, "1 pear"]],
  orange: [47, 0.9, 2.4, { each: 140, cup: 180 }, [5, 1814, "4 lb bag"]],
  banana: [89, 1.1, 2.6, { each: 118, cup: 150 }, [1.6, 708, "bunch of 6"]],
  berries: [50, 0.9, 3, { cup: 148, handful: 40 }, [4, 454, "1 lb pack"]],
  strawberries: [32, 0.7, 2, { cup: 152, each: 12 }, [3.5, 454, "1 lb pack"]],
  blueberries: [57, 0.7, 2.4, { cup: 148 }, [4, 340, "1 pint"]],
  raspberries: [52, 1.2, 6.5, { cup: 123 }, [3.5, 170, "6 oz pack"]],
  "frozen-fruit": [50, 0.8, 2, { cup: 140 }, [3.5, 454, "16 oz bag"]],
  carrot: [41, 0.9, 2.8, { each: 61, cup: 128 }, [1.8, 907, "2 lb bag"]],
  onion: [40, 1.1, 1.7, { each: 110, cup: 160 }, [3.5, 1361, "3 lb bag"]],
  lettuce: [17, 1.2, 2.1, { each: 626, leaf: 10, cup: 47 }, [2.5, 626, "1 head"]],
  tomato: [18, 0.9, 1.2, { each: 123, cup: 180 }, [2, 454, "1 lb"]],
  potato: [77, 2, 2.2, { each: 213, cup: 150 }, [4.5, 2268, "5 lb bag"]],
  "bell-pepper": [31, 1, 2.1, { each: 119, cup: 149 }, [1.25, 119, "1 pepper"]],
  garlic: [149, 6.4, 2.1, { clove: 3, cup: 136 }, [0.6, 40, "1 head"]],
  cabbage: [25, 1.3, 2.5, { each: 908, cup: 89 }, [1.6, 908, "1 head"]],
  greens: [23, 2.9, 2.2, { cup: 30, handful: 25 }, [3, 283, "10 oz bag"]],

  // Dairy and eggs
  milk: [61, 3.2, 0, { cup: 244 }, [4, 3900, "1 gallon"]],
  eggs: [143, 12.6, 0, { each: 50 }, [3.5, 600, "1 dozen"]],
  butter: [717, 0.9, 0, { cup: 227, stick: 113 }, [5, 454, "1 lb"]],
  cheese: [403, 23, 0, { cup: 113, slice: 21 }, [3, 227, "8 oz bag"]],
  cheddar: [403, 24.9, 0, { cup: 113, slice: 21 }, [3, 227, "8 oz bag"]],
  parmesan: [420, 29, 0, { cup: 100 }, [4.5, 227, "8 oz"]],
  mozzarella: [300, 24, 0, { cup: 113, slice: 21 }, [3, 227, "8 oz bag"]],
  "cream-cheese": [342, 6, 0, { cup: 232 }, [2.5, 227, "8 oz block"]],
  yogurt: [61, 3.5, 0, { cup: 245 }, [3.5, 907, "32 oz tub"]],

  // Protein
  chicken: [120, 22.5, 0, { each: 250 }, [9, 1361, "3 lb pack"]],
  "ground-beef": [254, 17.2, 0, {}, [5.5, 454, "1 lb"]],
  "ground-turkey": [150, 19.7, 0, {}, [5, 454, "1 lb"]],
  sausage: [300, 13, 0, { each: 60 }, [4, 340, "12 oz pack"]],
  "hot-dogs": [290, 10.3, 0, { each: 45 }, [3, 340, "pack of 8"]],
  "canned-meat": [160, 25, 0, { can: 280, cup: 140 }, [3.5, 280, "12.5 oz can"]],
  "canned-chicken": [160, 25, 0, { can: 280, cup: 140 }, [3.5, 280, "12.5 oz can"]],
  "canned-tuna": [116, 25.5, 0, { can: 113, cup: 150 }, [1.25, 113, "5 oz can"]],
  "canned-turkey": [160, 24, 0, { can: 280, cup: 140 }, [4, 280, "12.5 oz can"]],
  lentils: [352, 24.6, 10.7, { cup: 192 }, [1.8, 454, "1 lb bag"]],
  "canned-beans": [91, 6, 6.9, { can: 255, cup: 172 }, [1.1, 255, "15 oz can"]],
  "black-beans": [91, 6, 6.9, { can: 255, cup: 172 }, [1.1, 255, "15 oz can"]],
  "kidney-beans": [84, 5.2, 5.4, { can: 255, cup: 177 }, [1.1, 255, "15 oz can"]],
  "pinto-beans": [86, 4.9, 4.6, { can: 255, cup: 171 }, [1.1, 255, "15 oz can"]],
  chickpeas: [139, 7, 6, { can: 240, cup: 164 }, [1.1, 240, "15 oz can"]],
  "peanut-butter": [588, 25, 6, { cup: 258 }, [3, 454, "16 oz jar"]],

  // Grains and bread
  pasta: [371, 13, 3.2, { cup: 105 }, [1.5, 454, "1 lb box"]],
  noodles: [436, 10, 2.4, { packet: 85, cup: 50 }, [0.4, 85, "3 oz packet"]],
  rice: [365, 7.1, 1.3, { cup: 185 }, [2.5, 907, "2 lb bag"]],
  oats: [379, 13, 10, { cup: 81 }, [4.5, 1190, "42 oz canister"]],
  cereal: [370, 9, 6, { cup: 30 }, [3.5, 340, "12 oz box"]],
  tortillas: [306, 8.2, 2.3, { each: 45 }, [3, 450, "pack of 10"]],
  bread: [265, 9, 2.7, { slice: 28 }, [2.5, 567, "20 oz loaf"]],
  "biscuit-dough": [300, 6, 1, { can: 340, each: 42 }, [2.5, 340, "can of 8"]],
  chips: [489, 7, 4.4, { cup: 28, handful: 28 }, [3.5, 369, "13 oz bag"]],

  // Canned (drained weights for vegetables)
  "canned-vegetables": [49, 2.6, 3, { can: 250, cup: 163 }, [1, 250, "15 oz can"]],
  "canned-corn": [67, 2.2, 1.7, { can: 250, cup: 165 }, [1, 250, "15 oz can"]],
  "canned-peas": [68, 4.5, 4.1, { can: 250, cup: 170 }, [1, 250, "15 oz can"]],
  "canned-green-beans": [21, 1.1, 1.9, { can: 240, cup: 135 }, [1, 240, "14.5 oz can"]],
  "canned-carrots": [25, 0.6, 1.5, { can: 240, cup: 146 }, [1, 240, "14.5 oz can"]],
  "canned-mixed-veg": [49, 2.6, 3, { can: 250, cup: 163 }, [1, 250, "15 oz can"]],
  "canned-spinach": [23, 2.8, 2.4, { can: 214, cup: 214 }, [1.25, 214, "13.5 oz can"]],
  "diced-tomatoes": [20, 0.9, 1, { can: 411, cup: 240 }, [1.2, 411, "14.5 oz can"]],
  "tomato-puree": [38, 1.7, 1.9, { can: 425, cup: 250 }, [1.3, 425, "15 oz can"]],
  "pasta-sauce": [50, 1.5, 2, { cup: 250 }, [2.5, 680, "24 oz jar"]],
  soup: [80, 1.5, 0.5, { can: 298, cup: 250 }, [1.3, 298, "10.5 oz can"]],
  "cream-of-mushroom": [80, 1.5, 0.5, { can: 298, cup: 250 }, [1.3, 298, "10.5 oz can"]],
  "cream-of-chicken": [98, 2.4, 0.4, { can: 298, cup: 250 }, [1.3, 298, "10.5 oz can"]],
  "chicken-broth": [5, 0.5, 0, { cup: 240, can: 411 }, [2.5, 946, "32 oz carton"]],

  // Baking
  flour: [364, 10.3, 2.7, { cup: 125 }, [3.5, 2268, "5 lb bag"]],
  sugar: [387, 0, 0, { cup: 200 }, [3.5, 1814, "4 lb bag"]],
  "baking-powder": [53, 0, 0.2, { cup: 192 }, [2.5, 227, "8 oz can"]],
  "baking-soda": [0, 0, 0, { cup: 220 }, [1.2, 454, "1 lb box"]],

  // Condiments and staples
  jelly: [266, 0.2, 1, { cup: 304 }, [2.5, 510, "18 oz jar"]],
  mayo: [680, 1, 0, { cup: 220 }, [4.5, 850, "30 oz jar"]],
  honey: [304, 0.3, 0.2, { cup: 339 }, [4, 340, "12 oz bottle"]],
  oil: [884, 0, 0, { cup: 218 }, [4.5, 1300, "48 oz bottle"]],
  salt: [0, 0, 0, { cup: 292 }, [1.2, 737, "26 oz canister"]],
  pepper: [251, 10, 25, { cup: 110 }, [3, 85, "3 oz tin"]],
  "garlic-ginger-paste": [110, 3, 3, { cup: 240 }, [3, 283, "10 oz jar"]],

  // Extras
  cinnamon: [247, 4, 53, { cup: 125 }, [2, 68, "2.4 oz jar"]],
  "chili-powder": [282, 13.5, 35, { cup: 128 }, [2, 71, "2.5 oz jar"]],
  cumin: [375, 18, 10.5, { cup: 100 }, [2.5, 42, "1.5 oz jar"]],
  paprika: [282, 14, 35, { cup: 109 }, [2, 60, "2.1 oz jar"]],
  "italian-seasoning": [265, 9, 40, { cup: 48 }, [2, 26, "0.9 oz jar"]],
  "soy-sauce": [53, 8, 0.8, { cup: 255 }, [2.5, 296, "10 oz bottle"]],
  vinegar: [18, 0, 0, { cup: 238 }, [1.5, 946, "32 oz bottle"]],
  "lemon-juice": [22, 0.4, 0.3, { cup: 244 }, [2.5, 444, "15 oz bottle"]],
  "hot-sauce": [12, 0.5, 0.3, { cup: 240 }, [2, 148, "5 oz bottle"]],
  vanilla: [288, 0.1, 0, { cup: 208 }, [4, 30, "1 oz bottle"]],

  // Free
  water: [0, 0, 0, { cup: 237 }],
  ice: [0, 0, 0, { cup: 140, handful: 100 }],
};

/** Cooked-grain conversions, keyed by ingredient id. */
const COOKED: Record<string, IngredientFacts["cooked"]> = {
  rice: { cupGrams: 158, yield: 3 },
};

export const FACTS: Readonly<Record<string, IngredientFacts>> = Object.fromEntries(
  Object.entries(ROWS).map(([id, [kcal, protein, fiber, grams, pack]]) => [
    id,
    {
      kcal,
      protein,
      fiber,
      grams,
      ...(COOKED[id] ? { cooked: COOKED[id] } : {}),
      ...(pack ? { pack: { usd: pack[0], grams: pack[1], label: pack[2] } } : {}),
    },
  ]),
);

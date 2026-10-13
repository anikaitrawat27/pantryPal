/**
 * Spanish ingredient names. `plural` is used for counted items ("2 huevos").
 * `short` replaces the name after "lata de", so "1 lata de maíz" rather than
 * "1 lata de maíz enlatado". `aliases` add Spanish search terms.
 */
export interface IngredientEs {
  name: string;
  plural?: string;
  short?: string;
  aliases?: string[];
}

export const INGREDIENTS_ES: Readonly<Record<string, IngredientEs>> = {
  apple: { name: "manzana", plural: "manzanas" },
  pear: { name: "pera", plural: "peras" },
  orange: { name: "naranja", plural: "naranjas", aliases: ["mandarina"] },
  banana: { name: "plátano", plural: "plátanos", aliases: ["banana", "guineo", "banano"] },
  berries: { name: "frutos rojos", aliases: ["moras", "bayas"] },
  strawberries: { name: "fresas", aliases: ["fresa", "frutillas"] },
  blueberries: { name: "arándanos", aliases: ["arándano"] },
  raspberries: { name: "frambuesas", aliases: ["frambuesa"] },
  "frozen-fruit": { name: "fruta congelada" },
  carrot: { name: "zanahoria", plural: "zanahorias" },
  onion: { name: "cebolla", plural: "cebollas", aliases: ["cebollín", "cebolla verde"] },
  lettuce: { name: "lechuga", plural: "lechugas" },
  tomato: { name: "tomate", plural: "tomates", aliases: ["jitomate"] },
  potato: { name: "papa", plural: "papas", aliases: ["patata"] },
  "bell-pepper": { name: "pimiento", plural: "pimientos", aliases: ["chile morrón", "pimentón", "morrón"] },
  garlic: { name: "ajo", aliases: ["diente de ajo"] },
  cabbage: { name: "repollo", plural: "repollos", aliases: ["col"] },
  greens: { name: "hojas verdes", aliases: ["espinaca", "col rizada", "kale", "verduras de hoja"] },

  milk: { name: "leche" },
  eggs: { name: "huevo", plural: "huevos" },
  butter: { name: "mantequilla" },
  cheese: { name: "queso", aliases: ["queso rallado"] },
  cheddar: { name: "queso cheddar", aliases: ["cheddar"] },
  parmesan: { name: "queso parmesano", aliases: ["parmesano"] },
  mozzarella: { name: "queso mozzarella", aliases: ["mozzarella"] },
  "cream-cheese": { name: "queso crema" },
  yogurt: { name: "yogur", aliases: ["yogurt"] },

  chicken: { name: "pechuga de pollo", plural: "pechugas de pollo", aliases: ["pollo"] },
  "ground-beef": { name: "carne molida de res", aliases: ["carne molida", "res"] },
  "ground-turkey": { name: "pavo molido", aliases: ["pavo"] },
  sausage: { name: "salchicha", plural: "salchichas", aliases: ["chorizo"] },
  "hot-dogs": { name: "salchicha de hot dog", plural: "salchichas de hot dog", aliases: ["hot dog", "perro caliente"] },
  "canned-meat": { name: "carne enlatada", short: "carne" },
  "canned-chicken": { name: "pollo enlatado", short: "pollo" },
  "canned-tuna": { name: "atún enlatado", short: "atún", aliases: ["atún"] },
  "canned-turkey": { name: "pavo enlatado", short: "pavo" },
  lentils: { name: "lentejas", aliases: ["lenteja"] },
  "canned-beans": { name: "frijoles enlatados", short: "frijoles", aliases: ["frijoles", "habichuelas"] },
  "black-beans": { name: "frijoles negros", aliases: ["frijol negro"] },
  "kidney-beans": { name: "frijoles rojos", aliases: ["frijol rojo"] },
  "pinto-beans": { name: "frijoles pintos", aliases: ["frijol pinto", "frijoles refritos"] },
  chickpeas: { name: "garbanzos", aliases: ["garbanzo"] },
  "peanut-butter": { name: "crema de cacahuate", aliases: ["mantequilla de maní", "mantequilla de cacahuate", "crema de maní"] },

  pasta: { name: "pasta seca", aliases: ["pasta", "espagueti", "fideos", "coditos", "macarrones"] },
  noodles: { name: "fideos", aliases: ["ramen", "sopa instantánea", "tallarines"] },
  rice: { name: "arroz" },
  oats: { name: "avena" },
  cereal: { name: "cereal", aliases: ["hojuelas de maíz"] },
  tortillas: { name: "tortilla", plural: "tortillas", aliases: ["tortilla de harina"] },
  bread: { name: "pan", aliases: ["pan de caja", "bolillo"] },
  "biscuit-dough": { name: "masa de bisquets", aliases: ["masa para biscuits", "masa refrigerada"] },
  chips: { name: "totopos", aliases: ["papitas", "chips", "nachos"] },

  "canned-vegetables": { name: "verduras enlatadas", short: "verduras" },
  "canned-corn": { name: "maíz enlatado", short: "maíz", aliases: ["elote", "maíz"] },
  "canned-peas": { name: "chícharos enlatados", short: "chícharos", aliases: ["chícharos", "guisantes", "arvejas"] },
  "canned-green-beans": { name: "ejotes enlatados", short: "ejotes", aliases: ["ejotes", "judías verdes", "habichuelas tiernas"] },
  "canned-carrots": { name: "zanahorias enlatadas", short: "zanahorias" },
  "canned-mixed-veg": { name: "verduras mixtas enlatadas", short: "verduras mixtas", aliases: ["verduras mixtas"] },
  "canned-spinach": { name: "espinacas enlatadas", short: "espinacas" },
  "diced-tomatoes": { name: "tomate picado enlatado", short: "tomate picado", aliases: ["tomate en lata"] },
  "tomato-puree": { name: "puré de tomate", aliases: ["salsa de tomate"] },
  "pasta-sauce": { name: "salsa para pasta", aliases: ["salsa marinara"] },
  soup: { name: "crema de sopa enlatada", short: "crema de sopa", aliases: ["sopa condensada"] },
  "cream-of-mushroom": { name: "crema de champiñones", aliases: ["sopa de champiñones"] },
  "cream-of-chicken": { name: "crema de pollo", aliases: ["sopa de pollo"] },
  "chicken-broth": { name: "caldo de pollo", aliases: ["consomé"] },

  flour: { name: "harina" },
  sugar: { name: "azúcar" },
  "baking-powder": { name: "polvo para hornear" },
  "baking-soda": { name: "bicarbonato de sodio", aliases: ["bicarbonato"] },

  jelly: { name: "mermelada", aliases: ["jalea"] },
  mayo: { name: "mayonesa" },
  honey: { name: "miel" },
  oil: { name: "aceite", aliases: ["aceite vegetal"] },
  salt: { name: "sal" },
  pepper: { name: "pimienta negra", aliases: ["pimienta"] },
  "garlic-ginger-paste": { name: "pasta de ajo y jengibre", aliases: ["jengibre"] },

  cinnamon: { name: "canela" },
  "chili-powder": { name: "chile en polvo", aliases: ["chile", "cayena"] },
  cumin: { name: "comino" },
  paprika: { name: "pimentón", aliases: ["paprika"] },
  "italian-seasoning": { name: "hierbas italianas", aliases: ["orégano"] },
  "soy-sauce": { name: "salsa de soya", aliases: ["salsa de soja"] },
  vinegar: { name: "vinagre" },
  "lemon-juice": { name: "jugo de limón", aliases: ["limón"] },
  "hot-sauce": { name: "salsa picante", aliases: ["salsa"] },
  vanilla: { name: "extracto de vainilla", aliases: ["vainilla"] },

  water: { name: "agua" },
  ice: { name: "hielo" },
};

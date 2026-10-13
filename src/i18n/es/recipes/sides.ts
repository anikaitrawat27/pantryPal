import { defineRecipesEs } from "../../recipe-es";

export const SIDES_ES = defineRecipesEs({
  "stuffed-potato": {
    title: "Papas rellenas",
    blurb:
      "Papas cocidas en el microondas, vaciadas, machacadas con queso crema y queso cheddar, y vueltas a rellenar en su cáscara. Un acompañamiento o una comida ligera.",
    steps: [
      "Unte las papas con el aceite.",
      "Cocínelas en el microondas a potencia alta durante 12 minutos, volteándolas a la mitad del tiempo, hasta que un tenedor entre fácilmente.",
      "Deje enfriar las papas durante 5 minutos hasta que pueda tocarlas.",
      "Corte cada papa a la mitad a lo largo y saque la pulpa con una cuchara a un tazón, dejando una capa delgada en la cáscara.",
      "Machaque la pulpa de papa con el queso crema hasta que quede suave.",
      "Agregue casi todo el queso cheddar, la sal y la pimienta, y revuelva.",
      "Rellene las cáscaras con la mezcla usando una cuchara y ponga el resto del queso cheddar encima.",
      "Caliente en el microondas de 1 a 2 minutos hasta que el queso se derrita, o dore en la freidora de aire a 400°F durante 5 minutos hasta que la parte de arriba esté dorada.",
    ],
    notes: {
      potato: "grandes, tipo russet, bien lavadas y picadas con un tenedor",
      "cream-cheese": "a temperatura ambiente, suave",
      cheddar: "rallado",
    },
  },
  "deconstructed-elote": {
    title: "Elote desgranado (estilo esquites)",
    blurb:
      "Maíz tostado en sartén y mezclado con mayonesa, queso, jugo de limón y chile en polvo. El sabor del elote de la calle, hecho con maíz de lata.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio-alto.",
      "Agregue el maíz en una sola capa y cocine durante 3 minutos sin revolver.",
      "Revuelva y cocine de 4 a 5 minutos más hasta que muchos granos tengan partes doradas.",
      "Mezcle la mayonesa, el jugo de limón y una pizca de sal en un tazón.",
      "Agregue el maíz caliente y mezcle para cubrirlo.",
      "Espolvoree el queso y el chile en polvo y sirva tibio.",
    ],
    notes: {
      "canned-corn": "escurrido y secado con una toalla de papel",
      cheese: "desmoronado fino o rallado",
    },
  },
  "mashed-potatoes": {
    title: "Puré de papas",
    blurb:
      "Puré de papas suave, con mantequilla y leche tibia. El acompañamiento de todos los días para pollo, pastel de carne o cualquier platillo con gravy.",
    steps: [
      "Ponga las papas en una olla grande, cúbralas con agua fría y agregue una buena pizca de sal.",
      "Deje que hierva a fuego alto y luego cocine a fuego lento durante 15 minutos hasta que un tenedor entre fácilmente.",
      "Escurra las papas y regréselas a la olla.",
      "Agregue la mantequilla y la leche y machaque hasta que quede suave.",
      "Sazone con sal y pimienta y sirva caliente.",
    ],
    tips: [
      "Caliente la leche primero para que las papas no se enfríen. Agregue un poco más de leche si quiere un puré más suave.",
    ],
    notes: {
      potato: "peladas y cortadas en trozos grandes",
    },
  },
  "mexican-rice": {
    title: "Arroz rojo a la mexicana",
    blurb:
      "Arroz dorado en aceite y cocido con tomate, ajo y caldo hasta que quede esponjoso. Sírvalo con frijoles, tacos o pollo asado.",
    steps: [
      "Caliente el aceite en una cacerola a fuego medio.",
      "Agregue el arroz y cocine de 4 a 5 minutos, revolviendo seguido, hasta que esté ligeramente dorado.",
      "Agregue la cebolla y el ajo, revolviendo, y cocine durante 2 minutos.",
      "Agregue el puré de tomate, el caldo, el comino y una pizca de sal, y deje que hierva.",
      "Tape, baje el fuego a bajo y cocine durante 18 minutos sin levantar la tapa.",
      "Apague el fuego y deje reposar, tapado, durante 5 minutos.",
      "Esponje el arroz con un tenedor y sirva.",
    ],
    notes: {
      rice: "blanco de grano largo",
      onion: "picada finamente",
      garlic: "picado finamente",
    },
  },
  "refried-beans": {
    title: "Frijoles refritos",
    blurb:
      "Frijoles pintos de lata machacados en sartén con cebolla, ajo y comino. Listos en 15 minutos para tacos, burritos o como acompañamiento.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio.",
      "Cocine la cebolla durante 4 minutos hasta que esté suave.",
      "Agregue el ajo y el comino, revolviendo, y cocine durante 30 segundos.",
      "Agregue los frijoles y la mitad del agua.",
      "Machaque los frijoles con un machacador de papas o un tenedor mientras se calientan, agregando más agua hasta que queden cremosos.",
      "Cocine de 3 a 4 minutos, revolviendo, hasta que espesen.",
      "Sazone con sal y sirva caliente.",
    ],
    tips: ["Ponga queso rallado encima y deje que se derrita antes de servir."],
    notes: {
      onion: "picada finamente",
      garlic: "picado finamente",
      "pinto-beans": "escurridos y enjuagados",
    },
  },
  "skillet-green-beans": {
    title: "Ejotes salteados en sartén",
    blurb: "Ejotes de lata dorados en mantequilla con ajo. Una verdura rápida que acompaña casi cualquier cena.",
    steps: [
      "Derrita la mantequilla en un sartén a fuego medio-alto.",
      "Agregue la cebolla y cocine durante 3 minutos hasta que esté suave.",
      "Agregue los ejotes y cocine durante 5 minutos, revolviendo de vez en cuando, hasta que tengan partes doradas.",
      "Agregue el ajo, revolviendo, y cocine durante 1 minuto.",
      "Sazone con sal y pimienta y sirva.",
    ],
    notes: {
      "canned-green-beans": "escurridos y secados con una toalla de papel",
      onion: "en rodajas delgadas",
      garlic: "picado finamente",
    },
  },
  "honey-butter-glazed-carrots": {
    title: "Zanahorias glaseadas con miel y mantequilla",
    blurb:
      "Rodajas de zanahoria cocidas hasta que estén suaves y luego glaseadas con miel y mantequilla. Un acompañamiento dulce para pollo o cerdo asado.",
    steps: [
      "Ponga las zanahorias, el agua y una pizca de sal en un sartén a fuego medio-alto.",
      "Tape y cocine a fuego lento de 7 a 8 minutos hasta que las zanahorias apenas estén suaves.",
      "Destape y cocine hasta que casi toda el agua se haya evaporado.",
      "Agregue la mantequilla, la miel y la canela.",
      "Cocine de 3 a 4 minutos, revolviendo, hasta que las zanahorias estén brillantes y glaseadas.",
      "Sazone con sal y sirva.",
    ],
    notes: {
      carrot: "peladas y en rodajas",
    },
  },
  "creamed-spinach": {
    title: "Espinacas a la crema",
    blurb:
      "Espinacas en una salsa de queso crema con ajo y un poco de queso parmesano. Un acompañamiento sustancioso para bistec, pollo o papas.",
    steps: [
      "Derrita la mantequilla en una cacerola a fuego medio.",
      "Cocine la cebolla durante 3 minutos hasta que esté suave.",
      "Agregue el ajo, revolviendo, y cocine durante 30 segundos.",
      "Agregue el queso crema y la leche y revuelva hasta que quede suave.",
      "Agregue las espinacas y el queso parmesano, revolviendo, y cocine de 3 a 4 minutos hasta que esté caliente y cremoso.",
      "Sazone con sal y pimienta y sirva.",
    ],
    tips: [
      "También puede usar hojas verdes frescas o congeladas. Cocínelas hasta que se reduzcan y exprímales el agua primero.",
    ],
    notes: {
      "canned-spinach": "escurridas y exprimidas para quitarles el agua",
      onion: "picada finamente",
      garlic: "picado finamente",
      parmesan: "rallado",
    },
  },
  "skillet-potatoes": {
    title: "Papas doradas en sartén",
    blurb:
      "Papas en cubitos cocidas al vapor y luego doradas en un sartén tapado hasta que estén crujientes por fuera y suaves por dentro. Van bien con huevos o en la cena.",
    steps: [
      "Caliente el aceite en un sartén grande a fuego medio.",
      "Agregue las papas en una capa pareja y espolvoree sal.",
      "Agregue el agua, tape y cocine durante 10 minutos hasta que las papas estén casi suaves.",
      "Destape, agregue la cebolla y suba el fuego a medio-alto.",
      "Cocine de 10 a 12 minutos, volteando cada pocos minutos, hasta que estén doradas y crujientes.",
      "Espolvoree el pimentón y la pimienta, mezcle y sirva.",
    ],
    notes: {
      potato: "cortadas en cubitos",
      onion: "picada",
    },
  },
  "skillet-garlic-bread": {
    title: "Pan de ajo en sartén",
    blurb:
      "Rebanadas de pan untadas con mantequilla de ajo y tostadas en sartén hasta que estén crujientes. Sírvalo con pasta, sopa o ensalada.",
    steps: [
      "Mezcle la mantequilla, el ajo y las hierbas italianas en un tazón pequeño.",
      "Unte la mantequilla de ajo en un lado de cada rebanada de pan.",
      "Ponga el pan con el lado de la mantequilla hacia abajo en un sartén a fuego medio.",
      "Cocine de 2 a 3 minutos hasta que esté dorado y crujiente.",
      "Espolvoree el queso parmesano encima, voltee el pan y cocine 1 minuto más.",
      "Corte a la mitad y sirva tibio.",
    ],
    notes: {
      butter: "a temperatura ambiente, suave",
      garlic: "picado muy fino",
      parmesan: "rallado",
    },
  },
  "buttery-sauteed-cabbage": {
    title: "Repollo salteado con mantequilla",
    blurb:
      "Repollo y cebolla en tiras cocidos en mantequilla hasta que estén suaves y dorados en las orillas. Un acompañamiento barato para salchicha o pollo.",
    steps: [
      "Derrita la mantequilla en un sartén grande a fuego medio.",
      "Cocine la cebolla durante 4 minutos hasta que esté suave.",
      "Agregue el repollo y una pizca de sal.",
      "Cocine de 10 a 12 minutos, revolviendo de vez en cuando, hasta que el repollo esté suave y dorado en las orillas.",
      "Agregue el vinagre, sazone con sal y pimienta, y sirva.",
    ],
    notes: {
      onion: "en rodajas",
      cabbage: "en tiras delgadas",
    },
  },
  "jeera-rice": {
    title: "Arroz jeera (arroz con comino)",
    blurb:
      "Arroz al estilo de la India cocido con semillas de comino tostadas en mantequilla. Un acompañamiento aromático para dal o cualquier curry.",
    steps: [
      "Derrita la mantequilla en una cacerola a fuego medio.",
      "Agregue el comino y cocine durante 30 segundos hasta que chisporrotee y huela a tostado.",
      "Agregue la cebolla y cocine durante 3 minutos hasta que esté suave.",
      "Agregue el arroz, revolviendo, y cocine durante 1 minuto.",
      "Agregue el agua y una pizca de sal y deje que hierva.",
      "Tape, baje el fuego a bajo y cocine durante 15 minutos.",
      "Apague el fuego y deje reposar, tapado, durante 5 minutos, y luego esponje el arroz con un tenedor.",
    ],
    notes: {
      rice: "basmati o de grano largo, enjuagado",
      onion: "en rodajas delgadas",
    },
  },
  "rice-and-peas": {
    title: "Rice and Peas (arroz caribeño con frijoles)",
    blurb:
      "Arroz al estilo caribeño cocido con frijoles rojos, ajo y cebolla. Sírvalo con pollo guisado o como comida con hojas verdes al lado.",
    steps: [
      "Derrita la mantequilla en una cacerola a fuego medio.",
      "Cocine la cebolla durante 4 minutos hasta que esté suave.",
      "Agregue el ajo, revolviendo, y cocine durante 30 segundos.",
      "Agregue el arroz, los frijoles, el agua, las hierbas italianas y una buena pizca de sal, y deje que hierva.",
      "Tape, baje el fuego a bajo y cocine durante 18 minutos.",
      "Apague el fuego y deje reposar, tapado, durante 5 minutos.",
      "Esponje el arroz con un tenedor, sazone con pimienta y salsa picante, y sirva.",
    ],
    notes: {
      onion: "picada",
      garlic: "picado finamente",
      rice: "de grano largo, enjuagado",
      "kidney-beans": "escurridos y enjuagados",
    },
  },
  "buttered-peas-and-onions": {
    title: "Chícharos con cebolla en mantequilla",
    blurb:
      "Chícharos de lata calentados con cebolla suave en mantequilla. Un acompañamiento de cinco ingredientes listo en 10 minutos.",
    steps: [
      "Derrita la mantequilla en una cacerola a fuego medio.",
      "Cocine la cebolla durante 5 minutos hasta que esté suave y ligeramente dorada.",
      "Agregue los chícharos y revuelva con cuidado de 3 a 4 minutos hasta que estén calientes.",
      "Sazone con sal y pimienta y sirva.",
    ],
    notes: {
      onion: "picada",
      "canned-peas": "escurridos",
    },
  },
  "japanese-style-sweet-soy-carrots": {
    title: "Zanahorias dulces con soya al estilo japonés",
    blurb:
      "Tiras delgadas de zanahoria salteadas y glaseadas con salsa de soya y azúcar. Un acompañamiento pequeño para platos de arroz o para el almuerzo.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio-alto.",
      "Agregue las zanahorias y cocine de 3 a 4 minutos, revolviendo seguido, hasta que empiecen a ablandarse.",
      "Mezcle la salsa de soya, el azúcar y el agua en un tazón pequeño.",
      "Vierta la salsa sobre las zanahorias y cocine de 2 a 3 minutos, revolviendo, hasta que casi no quede líquido y las zanahorias se vean brillantes.",
      "Sirva tibias o a temperatura ambiente.",
    ],
    tips: ["Se conservan en el refrigerador por 4 días, así que son buenas para la lonchera."],
    notes: {
      carrot: "peladas y cortadas en palitos delgados",
    },
  },
});

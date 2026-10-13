import { defineRecipesEs } from "../../recipe-es";

export const MAINS_A_ES = defineRecipesEs({
  "pb-n-j-sandwich": {
    title: "Sándwich PB n J (crema de cacahuate y mermelada)",
    blurb:
      "El clásico sándwich de crema de cacahuate y mermelada. Se hace en dos minutos, sin cocinar, y es fácil de llevar a la escuela o al trabajo.",
    steps: [
      "Unte la crema de cacahuate sobre una rebanada de pan, hasta las orillas.",
      "Unte la mermelada sobre la otra rebanada.",
      "Junte las rebanadas con los rellenos hacia adentro.",
      "Corte a la mitad y sirva.",
    ],
    tips: [
      "Para llevar en el almuerzo, unte una capa delgada de crema de cacahuate en las dos rebanadas y ponga la mermelada en medio para que el pan no se moje.",
    ],
  },
  "veggie-wraps": {
    title: "Wraps de verduras",
    blurb:
      "Una tortilla enrollada en frío con queso y verduras crudas crujientes. Se prepara rápido para el almuerzo en un día caluroso.",
    steps: [
      "Extienda la tortilla y unte la mayonesa por el centro, si la usa.",
      "Espolvoree el queso sobre la tortilla.",
      "Acomode la lechuga, el tomate, la zanahoria y el pimiento sobre el queso en una franja pareja.",
      "Sazone con sal y pimienta.",
      "Doble los lados hacia adentro y enrolle la tortilla bien apretada desde abajo.",
      "Corte a la mitad en diagonal y sirva.",
    ],
    tips: ["Una tortilla fría se puede romper. Caliéntela unos segundos antes para que se enrolle sin rajarse."],
    notes: {
      tortillas: "grande, de harina",
      cheese: "rallado",
      tomato: "en rodajas",
      carrot: "rallada",
      "bell-pepper": "en tiras delgadas",
    },
  },
  "clt-sandwich": {
    title: "Sándwich CLT (pollo, lechuga y tomate)",
    blurb:
      "Pollo, lechuga y tomate en pan, hecho con pollo enlatado. Un almuerzo sin cocinar que toma unos cinco minutos.",
    steps: [
      "Mezcle el pollo con la mayonesa, la sal y la pimienta, deshaciendo los trozos grandes.",
      "Corte el tomate en rodajas delgadas.",
      "Ponga el tomate sobre una rebanada de pan y cúbralo con la lechuga.",
      "Ponga el pollo sobre la lechuga con una cuchara y tape con la otra rebanada de pan.",
      "Corte a la mitad y sirva.",
    ],
    notes: {
      "canned-chicken": "escurrido",
      bread: "tostado, si le gusta",
    },
  },
  "mexican-quesadillas": {
    title: "Quesadillas mexicanas",
    blurb:
      "Tortillas de harina doradas, rellenas de pechuga de pollo cocida en sartén y queso derretido. Un almuerzo que llena o una cena fácil para dos.",
    steps: [
      "Corte la pechuga de pollo a la mitad a lo largo, en horizontal, para que se cocine de forma pareja.",
      "Sazone el pollo con sal, pimienta, comino y chile en polvo.",
      "Caliente la mitad del aceite en un sartén a fuego medio por 2 minutos.",
      "Cocine el pollo de 5 a 6 minutos por cada lado, hasta que no quede nada rosado en el centro.",
      "Deje reposar el pollo 5 minutos y luego píquelo en trozos pequeños.",
      "Limpie el sartén, agregue el resto del aceite y baje el fuego a medio-bajo.",
      "Ponga una tortilla en el sartén, espolvoree un poco del queso, agregue un poco del pollo, luego un poco más de queso, y cubra con otra tortilla.",
      "Cocine de 2 a 3 minutos por cada lado, hasta que se dore y el queso se derrita.",
      "Repita con las tortillas que quedan y luego corte en triángulos y sirva.",
    ],
    tips: ["Sirva con una salsa hecha de un tomate picado, un poco de cebolla y sal."],
    notes: {
      chicken: "deshuesada, de unas 8 oz",
      tortillas: "de harina",
      cheese: "rallado",
    },
  },
  "chinese-fried-rice": {
    title: "Arroz frito chino",
    blurb:
      "Arroz frito con huevo, chícharos, zanahorias y maíz, hecho en un solo sartén. La mejor manera de aprovechar el arroz que sobró.",
    steps: [
      "Seque las verduras escurridas con una toalla de papel.",
      "Bata los huevos con una pizca de sal.",
      "Caliente la mitad del aceite en un sartén grande a fuego medio-alto.",
      "Revuelva los huevos hasta que apenas cuajen y páselos a un plato.",
      "Agregue el resto del aceite, el ajo y las verduras, y saltee por 2 minutos.",
      "Agregue el arroz, deshaciendo los grumos, y cocine de 4 a 5 minutos, apretándolo contra el sartén, hasta que esté caliente y algunos granos se doren.",
      "Regrese los huevos, agregue la salsa de soya y mezcle bien.",
      "Pruebe y sazone con sal.",
    ],
    tips: [
      "El arroz recién cocido queda aguado. Si no tiene arroz sobrante, extiéndalo en un plato y enfríelo en el refrigerador por lo menos una hora.",
    ],
    notes: {
      rice: "cocido y frío, de preferencia del día anterior",
      "canned-peas": "escurridos",
      "canned-carrots": "escurridas",
      "canned-corn": "escurrido",
      garlic: "picado finamente",
    },
  },
  spaghetti: {
    title: "Espagueti",
    blurb:
      "Espagueti mezclado con mantequilla, pimienta negra y queso parmesano, con agua de la pasta que lo convierte en una salsa brillante. Una cena rápida entre semana.",
    steps: [
      "Hierva el espagueti en una olla grande con agua con sal hasta que esté al dente.",
      "Saque una taza del agua de la pasta y luego escurra el espagueti.",
      "Caliente el aceite y la mantequilla en un sartén grande a fuego medio-bajo, agregue la pimienta y revuelva por 1 minuto.",
      "Vierta más o menos la mitad del agua de la pasta que guardó y deje que burbujee por 1 minuto.",
      "Agregue el espagueti y baje el fuego a bajo.",
      "Agregue el parmesano un puñado a la vez, mezclando sin parar, hasta que se derrita en una salsa suave.",
      "Agregue más agua de la pasta si la salsa se ve espesa o pegajosa.",
      "Sazone con sal y sirva de inmediato.",
    ],
    notes: {
      pasta: "espagueti",
      pepper: "recién molida, si la tiene",
      parmesan: "rallado fino",
    },
  },
  ramen: {
    title: "Ramen",
    blurb:
      "Ramen instantáneo cocido, escurrido y mezclado con su sazonador y una rebanada de queso derretido. Un plato rápido que toma unos cinco minutos.",
    steps: [
      "Ponga a hervir el agua en una cacerola pequeña.",
      "Agregue los fideos y cocine por 2 minutos, revolviendo para separarlos.",
      "Tire casi toda el agua y deje solo un chorrito en la cacerola.",
      "Agregue el sobre de sazonador y revuelva.",
      "Agregue el pollo, si lo usa, y revuelva a fuego bajo por 1 minuto hasta que esté caliente.",
      "Ponga el queso encima, tape y deje que se derrita por 1 minuto.",
      "Revuelva y sirva.",
    ],
    tips: ["Use la mitad del sobre de sazonador si lo quiere menos salado."],
    notes: {
      noodles: "ramen instantáneo, con su sobre de sazonador",
      "canned-chicken": "escurrido",
    },
  },
  "chicken-pasta": {
    title: "Pasta con pollo",
    blurb:
      "Pasta y pechuga de pollo en una salsa cremosa de ajo y parmesano hecha con mantequilla y leche. Una cena que llena, hecha en un solo sartén.",
    steps: [
      "Hierva la pasta en una olla grande con agua con sal hasta que esté al dente.",
      "Saque una taza del agua de la pasta y luego escurra la pasta.",
      "Corte el pollo en trozos del tamaño de un bocado y sazone con sal y pimienta.",
      "Derrita la mitad de la mantequilla en un sartén grande a fuego medio.",
      "Cocine el pollo de 6 a 8 minutos, revolviendo de vez en cuando, hasta que no quede nada rosado.",
      "Baje el fuego a medio-bajo, agregue el resto de la mantequilla y el ajo, y revuelva por 1 minuto.",
      "Vierta la leche y déjela llegar a un hervor suave.",
      "Agregue el parmesano un puñado a la vez, revolviendo hasta que se derrita.",
      "Agregue la pasta y las hierbas italianas y mezcle hasta que se cubra bien; agregue agua de la pasta si la salsa está espesa.",
      "Sazone con sal y pimienta y sirva con más parmesano.",
    ],
    notes: {
      pasta: "penne u otra pasta corta",
      chicken: "deshuesada, de unas 8 oz",
      garlic: "picado finamente",
      parmesan: "rallado, y un poco más para servir",
    },
  },
  "greens-pasta": {
    title: "Pasta con ejotes y chícharos",
    blurb:
      "Una pasta ligera con ejotes y chícharos enlatados salteados con ajo, terminada con queso. La cena está lista en unos 20 minutos.",
    steps: [
      "Hierva la pasta en una olla grande con agua con sal hasta que esté al dente.",
      "Saque una taza del agua de la pasta, luego escurra la pasta y mézclela con la mitad del aceite.",
      "Caliente el resto del aceite en un sartén a fuego medio y cocine el ajo por 30 segundos.",
      "Agregue los ejotes y los chícharos y cocine por 3 minutos, revolviendo.",
      "Agregue un chorrito del agua de la pasta, tape y cocine a fuego bajo por 3 minutos, hasta que las verduras estén suaves y calientes.",
      "Mezcle las verduras con la pasta y agregue más agua de la pasta si se ve seca.",
      "Sazone con sal y pimienta y ponga el parmesano encima.",
    ],
    notes: {
      garlic: "picado finamente",
      "canned-green-beans": "escurridos",
      "canned-peas": "escurridos",
      parmesan: "rallado",
    },
  },
  alfredo: {
    title: "Pasta Alfredo",
    blurb:
      "Pasta en una salsa espesa de mantequilla, leche y parmesano, aligerada con un poco de agua de la pasta. Comida reconfortante para una noche tranquila en casa.",
    steps: [
      "Hierva la pasta en una olla grande con agua con sal hasta que esté al dente.",
      "Saque una taza del agua de la pasta y luego escurra la pasta.",
      "Derrita la mantequilla en un sartén ancho a fuego bajo.",
      "Agregue el ajo, si lo usa, y revuelva por 30 segundos.",
      "Vierta la leche y caliéntela hasta que eche vapor, sin que hierva.",
      "Agregue la pasta y mezcle para cubrirla.",
      "Espolvoree el parmesano un puñado a la vez, mezclando hasta que se derrita en una salsa cremosa.",
      "Agregue agua de la pasta poco a poco si la salsa se pone muy espesa.",
      "Sazone con sal y pimienta y sirva de inmediato.",
    ],
    tips: ["Mantenga el fuego bajo después de agregar el queso. El fuego alto hace que la salsa quede granulosa."],
    notes: {
      pasta: "fettuccine o espagueti",
      garlic: "picado finamente",
      parmesan: "rallado fino",
    },
  },
  "skillet-veggie-quiche": {
    title: "Quiche de verduras en sartén",
    blurb:
      "Un quiche sin masa de huevos, hojas verdes, pimiento y tomate, cocido tapado en la estufa hasta que cuaje. Bueno caliente o frío para el almuerzo.",
    steps: [
      "Bata los huevos con la leche, la sal y la pimienta.",
      "Derrita la mantequilla en un sartén antiadherente con tapa a fuego medio.",
      "Cocine la cebolla y el pimiento por 4 minutos hasta que se suavicen.",
      "Agregue el tomate, las hojas verdes y las hierbas italianas y cocine por 2 minutos, hasta que las hojas se marchiten.",
      "Extienda las verduras de forma pareja y baje el fuego a bajo.",
      "Vierta los huevos sobre las verduras y espolvoree el queso, si lo usa.",
      "Tape y cocine a fuego bajo de 15 a 18 minutos, hasta que el centro esté cuajado y ya no se vea húmedo.",
      "Déjelo reposar 5 minutos, luego deslícelo a una tabla y córtelo en triángulos.",
    ],
    tips: ["Los triángulos que sobren duran 3 días en el refrigerador y son buenos fríos."],
    notes: {
      onion: "picada",
      "bell-pepper": "picado",
      tomato: "picado",
      greens: "picadas",
      cheese: "rallado",
    },
  },
  "black-bean-burger": {
    title: "Hamburguesa de frijoles negros",
    blurb:
      "Tortitas de frijoles negros y papa fritas en sartén, con verduras salteadas, servidas en pan con lechuga y tomate. Una noche de hamburguesas sin carne.",
    steps: [
      "Pique la papa con un tenedor y cocínela en el microondas a potencia alta de 5 a 6 minutos, volteándola a la mitad, hasta que esté suave.",
      "Cuando se pueda tocar, pele la papa y macháquela.",
      "Caliente los frijoles en un sartén seco a fuego bajo por 5 minutos, revolviendo, hasta que se vean secos.",
      "Pase los frijoles a un tazón y macháquelos con un tenedor, dejando algunos enteros.",
      "Caliente un poco del aceite en el sartén a fuego medio y cocine la cebolla, la zanahoria y el pimiento por 5 minutos hasta que se suavicen.",
      "Mezcle los frijoles, la papa, las verduras, la harina, el comino, el chile en polvo, la sal y la pimienta.",
      "Forme tortitas con la mezcla, una por porción.",
      "Caliente el resto del aceite en el sartén a fuego medio y cocine las tortitas de 4 a 5 minutos por cada lado, hasta que estén doradas y bien calientes por dentro.",
      "O unte las tortitas con aceite y cocínelas en la freidora de aire a 375°F de 10 a 12 minutos, volteándolas a la mitad.",
      "Sirva cada tortita entre rebanadas de pan con lechuga y tomate.",
    ],
    tips: [
      "Si las tortitas están muy suaves para formarlas, enfríelas en el refrigerador 15 minutos antes de cocinarlas.",
    ],
    notes: {
      potato: "mediana",
      "black-beans": "escurridos y enjuagados",
      onion: "picada finamente",
      carrot: "rallada fina",
      "bell-pepper": "picado finamente",
      bread: "o bolillos",
      tomato: "en rodajas",
    },
  },
  "pepper-and-onion-melt": {
    title: "Sándwich caliente de pimiento y cebolla",
    blurb:
      "Un sándwich dorado en sartén con pimiento y cebolla suaves bajo queso mozzarella derretido. Un almuerzo caliente sin carne.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio.",
      "Cocine el pimiento y la cebolla de 8 a 10 minutos, revolviendo de vez en cuando, hasta que estén suaves y dorados en las orillas.",
      "Sazone con las hierbas italianas, sal y pimienta, luego páselos a un plato y limpie el sartén.",
      "Unte mantequilla en un lado de cada rebanada de pan.",
      "Ponga la mitad de las rebanadas en el sartén con la mantequilla hacia abajo, a fuego medio-bajo.",
      "Cubra con la mitad del queso, el pimiento y la cebolla, el resto del queso y el pan que queda, con la mantequilla hacia arriba.",
      "Tape y cocine de 3 a 4 minutos, hasta que la parte de abajo esté dorada.",
      "Voltee y cocine sin tapar 3 minutos más, hasta que se dore y el queso se derrita.",
    ],
    notes: {
      "bell-pepper": "en tiras",
      onion: "en rodajas",
      butter: "suavizada",
      mozzarella: "rallado",
    },
  },
  "vegetable-lo-mein": {
    title: "Lo mein de verduras",
    blurb:
      "Fideos suaves salteados con pimiento, zanahoria, chícharos, hojas verdes y pasta de ajo y jengibre. Una cena estilo comida para llevar, hecha con lo que hay en la despensa.",
    steps: [
      "Cocine los fideos según las instrucciones del paquete, escúrralos y mézclelos con un poco del aceite.",
      "Caliente el resto del aceite en un sartén grande a fuego medio-alto.",
      "Agregue la cebolla, el pimiento, la zanahoria y la pasta de ajo y jengibre y saltee por 4 minutos, hasta que estén suaves pero todavía crujientes.",
      "Agregue los chícharos y cocine por 1 minuto.",
      "Agregue las hojas verdes y cocine por 2 minutos, hasta que se marchiten.",
      "Agregue los fideos y la salsa de soya y mezcle por 2 minutos, hasta que estén calientes y bien cubiertos.",
      "Sazone con sal y pimienta y sirva.",
    ],
    notes: {
      noodles: "o espagueti",
      onion: "en rodajas",
      "bell-pepper": "en tiras",
      carrot: "en palitos delgados",
      "canned-peas": "escurridos",
      greens: "la espinaca queda bien",
    },
  },
  "veggie-tacos": {
    title: "Tacos de verduras",
    blurb:
      "Tortillas de harina rellenas de frijoles negros y verduras doradas en sartén, con lechuga, tomate y queso encima. Una cena divertida sin carne.",
    steps: [
      "Seque las verduras mixtas con una toalla de papel.",
      "Caliente el aceite en un sartén grande a fuego medio-alto.",
      "Agregue las verduras y la mitad del tomate en una sola capa y sazone con comino, chile en polvo, sal y pimienta.",
      "Cocine sin revolver de 3 a 4 minutos, hasta que se doren en partes, luego revuelva y cocine de 3 a 4 minutos más.",
      "Caliente los frijoles en una olla pequeña a fuego bajo de 3 a 4 minutos.",
      "Caliente las tortillas en un sartén seco por 30 segundos de cada lado.",
      "Rellene las tortillas con los frijoles y las verduras doradas, y ponga encima la lechuga, el resto del tomate y el queso.",
    ],
    notes: {
      "canned-mixed-veg": "escurridas",
      tomato: "picados; la mitad para cocinar y la otra mitad para servir encima",
      "black-beans": "escurridos y enjuagados",
      tortillas: "pequeñas, de harina",
      lettuce: "picada en tiras finas",
      cheese: "rallado",
    },
  },
  "tortilla-pizza": {
    title: "Pizza en tortilla",
    blurb:
      "Una pizza delgada y crujiente en tortilla de harina con salsa, mozzarella y pimiento, cocida en un sartén tapado. Lista en unos 15 minutos.",
    steps: [
      "Ponga una tortilla en un sartén seco a fuego medio por 1 minuto, hasta que se ponga firme, y luego voltéela.",
      "Unte un poco de la salsa sobre la tortilla, dejando una orilla pequeña.",
      "Espolvoree un poco del queso y ponga encima el pimiento, la cebolla y las hierbas italianas.",
      "Tape y cocine a fuego medio-bajo de 4 a 5 minutos, hasta que el queso se derrita y la parte de abajo esté crujiente.",
      "O cocine la tortilla con los ingredientes en la freidora de aire a 375°F de 4 a 6 minutos, hasta que el queso burbujee.",
      "Deslícela a una tabla y córtela en cuatro.",
      "Repita con las tortillas que quedan.",
    ],
    notes: {
      tortillas: "grandes, de harina",
      mozzarella: "rallado",
      "bell-pepper": "en tiras delgadas",
      onion: "en rodajas delgadas",
    },
  },
  "buddha-bowl": {
    title: "Buddha bowl (tazón de arroz y lentejas)",
    blurb:
      "Un tazón de arroz y lentejas con pimiento y cebolla dorados en sartén, repollo crujiente, zanahoria y tomate encima. Una comida sin carne que llena.",
    steps: [
      "Cubra las lentejas con bastante agua en una olla, póngalas a hervir y cocínelas a fuego lento de 20 a 25 minutos, hasta que estén suaves.",
      "Escurra las lentejas y sazónelas con sal.",
      "Mientras tanto, ponga el arroz en una cacerola con el doble de su volumen de agua y una pizca de sal, y póngalo a hervir.",
      "Tape el arroz, baje el fuego a bajo y cocine por 15 minutos; luego déjelo reposar fuera del fuego por 5 minutos.",
      "Caliente la mitad del aceite en un sartén a fuego medio-alto.",
      "Agregue el pimiento y la cebolla con una pizca de sal y el pimentón, y cocine de 8 a 10 minutos, revolviendo de vez en cuando, hasta que estén tostados en las orillas.",
      "Reparta el arroz y las lentejas en los tazones y acomode encima las verduras doradas, el repollo, la zanahoria y el tomate.",
      "Rocíe con el resto del aceite y el jugo de limón, y sazone con sal y pimienta.",
    ],
    tips: [
      "Haga el doble de arroz y lentejas y guárdelos en el refrigerador para armar tazones rápidos durante la semana.",
    ],
    notes: {
      lentils: "secas, enjuagadas",
      rice: "crudo",
      water: "para el arroz y las lentejas",
      "bell-pepper": "en tiras",
      onion: "en gajos",
      cabbage: "picado en tiras finas",
      carrot: "rallada",
      tomato: "en rodajas",
    },
  },
  "tuna-melt": {
    title: "Sándwich caliente de atún",
    blurb:
      "Ensalada de atún y queso cheddar dorados en sartén entre pan con mantequilla hasta que el pan esté crujiente y el queso derretido. Un sándwich caliente para un día frío.",
    steps: [
      "Mezcle el atún con la mayonesa, la cebolla y la pimienta.",
      "Unte mantequilla en un lado de cada rebanada de pan.",
      "Ponga la mitad de las rebanadas en un sartén con la mantequilla hacia abajo, a fuego medio-bajo.",
      "Ponga encima de cada una una rebanada de queso, un poco del atún y otra rebanada de pan, con la mantequilla hacia arriba.",
      "Tape y cocine de 3 a 4 minutos, hasta que la parte de abajo esté dorada.",
      "Voltee y cocine sin tapar 3 minutos más, hasta que se dore y el queso se derrita.",
    ],
    notes: {
      "canned-tuna": "escurrido",
      onion: "picada finamente",
      butter: "suavizada",
    },
  },
  "egg-salad-sandwich": {
    title: "Sándwich de ensalada de huevo",
    blurb:
      "Huevos duros picados y mezclados con mayonesa y un poco de pimentón, servidos en pan con lechuga. Un almuerzo que se puede preparar con anticipación.",
    steps: [
      "Ponga los huevos en una cacerola y cúbralos con agua fría, una pulgada por encima.",
      "Póngalos a hervir a fuego alto, luego tape, apague el fuego y déjelos reposar 10 minutos.",
      "Pase los huevos a un tazón con agua fría por 5 minutos y luego pélelos.",
      "Pique los huevos y mézclelos con la mayonesa, la sal, la pimienta y el pimentón.",
      "Tueste el pan en el tostador, si quiere.",
      "Unte la ensalada de huevo sobre la mitad de las rebanadas de pan, agregue la lechuga y cubra con el resto del pan.",
    ],
    tips: ["La ensalada de huevo dura 2 días en el refrigerador. Arme los sándwiches justo antes de comer."],
  },
  "grilled-cheese-with-tomato": {
    title: "Sándwich de queso a la plancha con tomate",
    blurb:
      "Un sándwich de queso con mantequilla, dorado en sartén, con rodajas delgadas de tomate derretidas en el queso cheddar. Un almuerzo rápido para cualquier día.",
    steps: [
      "Unte mantequilla en un lado de cada rebanada de pan.",
      "Ponga la mitad de las rebanadas en un sartén con la mantequilla hacia abajo, a fuego medio-bajo.",
      "Ponga encima de cada una una rebanada de queso, unas rodajas de tomate sazonadas con sal y pimienta, otra rebanada de queso y una rebanada de pan, con la mantequilla hacia arriba.",
      "Cocine de 3 a 4 minutos, hasta que la parte de abajo esté dorada.",
      "Voltee, aplaste un poco con una espátula y cocine 3 minutos más, hasta que se dore y el queso se derrita.",
    ],
    tips: ["Seque las rodajas de tomate con una toalla de papel para que el pan quede crujiente."],
    notes: {
      butter: "suavizada",
      tomato: "en rodajas delgadas",
    },
  },
  "bean-and-cheese-burritos": {
    title: "Burritos de frijoles con queso",
    blurb:
      "Tortillas de harina enrolladas con frijoles pintos refritos y sazonados y queso cheddar, doradas en sartén. Se congelan bien para almuerzos rápidos.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio y cocine la cebolla por 4 minutos, hasta que se suavice.",
      "Agregue el ajo, el comino y el chile en polvo y revuelva por 30 segundos.",
      "Agregue los frijoles y el agua y cocine a fuego lento por 5 minutos.",
      "Machaque los frijoles con un tenedor o un machacador de papas hasta que estén espesos y casi lisos, y sazone con sal.",
      "Unte los frijoles por el centro de cada tortilla y espolvoree el queso y la salsa picante.",
      "Doble los lados hacia adentro y enrolle bien apretado.",
      "Limpie el sartén y cocine los burritos con la unión hacia abajo a fuego medio por 2 minutos de cada lado, hasta que se doren.",
      "O cocínelos en la freidora de aire a 375°F por 6 minutos, hasta que estén crujientes.",
    ],
    tips: [
      "Envuelva cada burrito ya frío por separado y congélelo. Caliéntelo congelado en el microondas por 2 minutos, volteándolo una vez.",
    ],
    notes: {
      onion: "picada finamente",
      garlic: "picado finamente",
      "pinto-beans": "escurridos",
      tortillas: "grandes, de harina",
      cheddar: "rallado",
    },
  },
  "chana-masala": {
    title: "Chana Masala (garbanzos al curry)",
    blurb:
      "Garbanzos cocidos a fuego lento en una salsa de cebolla y tomate con especias, ajo y jengibre. Una cena vegetariana que llena, con arroz o pan.",
    steps: [
      "Caliente el aceite en una olla a fuego medio.",
      "Cocine la cebolla de 8 a 10 minutos, revolviendo seguido, hasta que esté bien dorada.",
      "Agregue la pasta de ajo y jengibre, el comino, el chile en polvo y el pimentón y revuelva por 1 minuto.",
      "Agregue el tomate y cocine por 5 minutos, machacándolo, hasta que espese y el aceite empiece a separarse.",
      "Agregue los garbanzos, el agua y la sal y cocine a fuego lento por 15 minutos, revolviendo de vez en cuando.",
      "Machaque algunos garbanzos contra la pared de la olla para espesar la salsa.",
      "Agregue el jugo de limón, revuelva y pruebe de sal.",
    ],
    tips: ["Sirva con arroz, o con tortillas calentadas en un sartén seco en lugar de pan plano."],
    notes: {
      onion: "picada finamente",
      chickpeas: "escurridos y enjuagados",
    },
  },
  "caribbean-rice-and-beans": {
    title: "Arroz con frijoles caribeño",
    blurb:
      "Arroz y frijoles rojos cocidos juntos en una sola olla con cebolla, pimiento y ajo. Una cena sencilla con un chorrito de salsa picante.",
    steps: [
      "Caliente el aceite en una cacerola a fuego medio y cocine la cebolla y el pimiento por 5 minutos, hasta que se suavicen.",
      "Agregue el ajo y revuelva por 30 segundos.",
      "Agregue el arroz y tuéstelo por 1 minuto, revolviendo.",
      "Agregue el agua, los frijoles, el pimentón, la sal y la pimienta y póngalo a hervir.",
      "Tape, baje el fuego a bajo y cocine por 18 minutos.",
      "Déjelo reposar tapado, fuera del fuego, por 5 minutos.",
      "Esponje el arroz con un tenedor y sirva con salsa picante.",
    ],
    notes: {
      onion: "picada",
      "bell-pepper": "picado",
      garlic: "picado finamente",
      rice: "de grano largo, enjuagado",
      "kidney-beans": "escurridos y enjuagados",
    },
  },
  "stovetop-mac-and-cheese": {
    title: "Macarrones con queso en la estufa",
    blurb:
      "Coditos en una salsa suave de queso cheddar, hechos en una sola olla en la estufa. Una cena familiar en menos de 30 minutos.",
    steps: [
      "Hierva la pasta en una olla grande con agua con sal hasta que apenas esté suave y luego escúrrala.",
      "Derrita la mantequilla en la misma olla a fuego medio.",
      "Agregue la harina batiendo y cocine por 1 minuto.",
      "Agregue la leche poco a poco, batiendo, y cocine de 4 a 5 minutos, revolviendo, hasta que la salsa cubra una cuchara.",
      "Retire la olla del fuego y agregue el cheddar un puñado a la vez, revolviendo hasta que quede liso.",
      "Agregue la pasta, la sal y la pimienta y revuelva.",
      "Espolvoree con pimentón y sirva.",
    ],
    notes: {
      pasta: "coditos",
      cheddar: "rallado",
    },
  },
  "skillet-ziti": {
    title: "Ziti en sartén",
    blurb:
      "Ziti en salsa de tomate con bolitas de queso crema, cubierto con mozzarella y derretido bajo la tapa en la estufa.",
    steps: [
      "Hierva la pasta en una olla grande con agua con sal 2 minutos menos de lo que dice el paquete y luego escúrrala.",
      "Caliente el aceite en un sartén grande con tapa a fuego medio y cocine la cebolla por 4 minutos.",
      "Agregue el ajo y las hierbas italianas y revuelva por 30 segundos.",
      "Agregue la salsa para pasta y cocine a fuego lento por 5 minutos.",
      "Agregue la pasta, revuelva y ponga encima bolitas de queso crema con una cuchara.",
      "Espolvoree el mozzarella y el parmesano.",
      "Tape y cocine a fuego bajo de 5 a 7 minutos, hasta que el queso se derrita y la salsa burbujee.",
    ],
    tips: [
      "Para una versión con carne, dore carne molida de res o salchicha con la cebolla y cocínela hasta que no quede nada rosado.",
    ],
    notes: {
      pasta: "ziti o penne",
      onion: "picada",
      garlic: "picado finamente",
      mozzarella: "rallado",
      parmesan: "rallado",
    },
  },
  "peanut-noodles": {
    title: "Fideos con crema de cacahuate",
    blurb:
      "Fideos mezclados con una salsa de crema de cacahuate, salsa de soya y pasta de ajo y jengibre, con repollo y zanahoria crujientes. Buenos calientes o fríos para el almuerzo.",
    steps: [
      "Hierva los fideos según las instrucciones del paquete.",
      "Saque unas cucharadas del agua caliente de los fideos y luego escurra los fideos.",
      "Bata la crema de cacahuate, la salsa de soya, la miel, la pasta de ajo y jengibre, el vinagre y la salsa picante con el agua de los fideos hasta que quede lisa y se pueda verter.",
      "Mezcle los fideos con la salsa, el repollo y la zanahoria.",
      "Sirva caliente, o enfríe y sirva frío.",
    ],
    notes: {
      cabbage: "picado en tiras finas",
      carrot: "rallada",
    },
  },
  "vegetable-yakisoba": {
    title: "Yakisoba de verduras",
    blurb:
      "Fideos salteados al estilo japonés con repollo, zanahoria y cebolla en una salsa de soya dulce. Una cena en un solo sartén en 20 minutos.",
    steps: [
      "Cocine los fideos 1 minuto menos de lo que dice el paquete, luego escúrralos y enjuáguelos con agua fría.",
      "Mezcle la salsa de soya, el azúcar y el vinagre.",
      "Caliente el aceite en un sartén grande a fuego medio-alto y cocine la cebolla y la zanahoria por 3 minutos.",
      "Agregue el repollo y el pimiento y cocine por 3 minutos, hasta que se marchiten y se doren en partes.",
      "Agregue los fideos y la salsa y mezcle de 2 a 3 minutos, hasta que la salsa se absorba.",
    ],
    notes: {
      noodles: "ramen instantáneo, sin los sobres de sazonador",
      onion: "en rodajas",
      carrot: "en palitos delgados",
      cabbage: "picado en tiras finas",
      "bell-pepper": "en tiras",
    },
  },
  "bibimbap-rice-bowl": {
    title: "Bibimbap (tazón de arroz coreano)",
    blurb:
      "Arroz caliente con hojas verdes al ajo, zanahoria salteada, un huevo frito y una salsa de soya dulce y picante. Mezcle todo antes de comer.",
    steps: [
      "Caliente el arroz tapado en el microondas de 1 a 2 minutos, hasta que esté caliente.",
      "Caliente un poco del aceite en un sartén a fuego medio y cocine la zanahoria con una pizca de sal de 2 a 3 minutos; luego apártela.",
      "Agregue un poco más de aceite, las hojas verdes y el ajo y cocine de 1 a 2 minutos, hasta que se marchiten.",
      "Sazone las hojas verdes con un poco de la salsa de soya y apártelas.",
      "Mezcle el resto de la salsa de soya con el azúcar y la salsa picante.",
      "Agregue el resto del aceite al sartén y fría los huevos hasta que las claras estén cuajadas.",
      "Reparta el arroz en los tazones, ponga encima la zanahoria, las hojas verdes y un huevo, y rocíe con la salsa.",
    ],
    tips: ["Para un tazón más sustancioso, agregue carne molida de res dorada, cocida hasta que no quede nada rosado."],
    notes: {
      rice: "cocido",
      carrot: "en palitos delgados",
      greens: "la espinaca queda bien",
      garlic: "picado finamente",
    },
  },
  "mediterranean-chickpea-rice-bowl": {
    title: "Tazón mediterráneo de arroz con garbanzos",
    blurb:
      "Garbanzos crujientes con especias sobre arroz, con tomate, lechuga y una salsa de yogur con ajo. Un almuerzo vegetariano que llena.",
    steps: [
      "Seque los garbanzos con una toalla de papel.",
      "Caliente el aceite en un sartén a fuego medio-alto y cocine los garbanzos de 8 a 10 minutos, moviendo el sartén seguido, hasta que estén dorados y crujientes.",
      "En el último minuto, espolvoree los garbanzos con el pimentón, el comino y una pizca de sal.",
      "Mezcle el yogur con el ajo, el jugo de limón y una pizca de sal.",
      "Caliente el arroz tapado en el microondas de 1 a 2 minutos.",
      "Reparta el arroz en los tazones y ponga encima los garbanzos, el tomate, la lechuga y la cebolla.",
      "Ponga la salsa de yogur encima con una cuchara y sazone con pimienta.",
    ],
    notes: {
      chickpeas: "escurridos y enjuagados",
      garlic: "rallado",
      rice: "cocido",
      tomato: "picado",
      lettuce: "picada en tiras finas",
      onion: "en rodajas delgadas",
    },
  },
  "arroz-con-verduras": {
    title: "Arroz con verduras",
    blurb:
      "Arroz al estilo español hecho en sartén con pimiento, cebolla, tomate, ajo y pimentón ahumado, terminado con ejotes. Una cena vegetariana en un solo sartén.",
    steps: [
      "Caliente el aceite en un sartén ancho a fuego medio y cocine la cebolla y el pimiento por 6 minutos, hasta que se suavicen.",
      "Agregue el ajo y el tomate y cocine por 3 minutos, hasta que el tomate se deshaga.",
      "Agregue el pimentón y el arroz, revuelva y cocine por 1 minuto.",
      "Agregue el agua y la sal y póngalo a hervir.",
      "Reparta los ejotes y los chícharos por encima, baje el fuego a bajo y cocine a fuego lento sin tapar de 18 a 20 minutos, sin revolver, hasta que el arroz esté suave.",
      "Tape y déjelo reposar fuera del fuego por 5 minutos.",
      "Rocíe con el jugo de limón y sirva desde el sartén.",
    ],
    notes: {
      onion: "picada",
      "bell-pepper": "picado",
      garlic: "picado finamente",
      tomato: "rallado o picado finamente",
      paprika: "ahumado, si lo tiene",
      rice: "de grano corto o mediano",
      "canned-green-beans": "escurridos",
      "canned-peas": "escurridos",
    },
  },
  "egg-fried-noodles": {
    title: "Fideos fritos con huevo",
    blurb:
      "Fideos salteados con huevo revuelto, repollo, cebolla y salsa de soya. Una cena rápida con unos cuantos ingredientes básicos de la despensa.",
    steps: [
      "Cocine los fideos según las instrucciones del paquete, luego escúrralos y enjuáguelos con agua fría.",
      "Bata los huevos con la sal.",
      "Caliente la mitad del aceite en un sartén grande a fuego medio y revuelva los huevos hasta que apenas cuajen; luego páselos a un plato.",
      "Agregue el resto del aceite y suba el fuego a medio-alto.",
      "Cocine la cebolla y el repollo por 3 minutos, luego agregue el ajo y revuelva por 30 segundos.",
      "Agregue los fideos, la salsa de soya y el azúcar y mezcle de 2 a 3 minutos, dejando que los fideos se doren en partes.",
      "Regrese los huevos, desbarátelos y mezcle. Sazone con pimienta.",
    ],
    notes: {
      noodles: "ramen instantáneo, sin los sobres de sazonador",
      onion: "en rodajas",
      cabbage: "picado en tiras finas",
      garlic: "picado finamente",
    },
  },
  "turkey-croque-monsieur": {
    title: "Croque Monsieur de pavo",
    blurb:
      "Un sándwich caliente al estilo francés de pavo y queso con una salsa blanca cremosa, dorado en un sartén tapado. Un almuerzo acogedor para el fin de semana.",
    steps: [
      "Derrita la mitad de la mantequilla en una cacerola pequeña a fuego medio y agregue la harina batiendo por 1 minuto.",
      "Agregue la leche poco a poco, batiendo, y cocine a fuego lento de 2 a 3 minutos, revolviendo, hasta que espese.",
      "Agregue un puñadito del queso y sazone la salsa con sal y pimienta.",
      "Unte una capa delgada de salsa sobre la mitad de las rebanadas de pan.",
      "Ponga encima el pavo, la mitad del queso que queda y las otras rebanadas de pan.",
      "Unte el resto de la mantequilla por fuera de los sándwiches.",
      "Cocine en un sartén tapado a fuego medio-bajo de 3 a 4 minutos por cada lado, hasta que se doren.",
      "Ponga el resto de la salsa encima con una cuchara, espolvoree el resto del queso, tape y cocine de 1 a 2 minutos, hasta que se derrita.",
    ],
    notes: {
      mozzarella: "rallado",
      "canned-turkey": "escurrido y desmenuzado",
    },
  },
  "aloo-matar": {
    title: "Aloo Matar (papas con chícharos al curry)",
    blurb:
      "Papas y chícharos cocidos a fuego lento en una salsa de tomate y cebolla con especias. Un curry vegetariano del norte de la India para servir con arroz o pan.",
    steps: [
      "Caliente el aceite en una olla a fuego medio y agregue el comino, si lo usa, por 30 segundos.",
      "Cocine la cebolla de 6 a 8 minutos, hasta que se dore.",
      "Agregue la pasta de ajo y jengibre y revuelva por 1 minuto.",
      "Agregue el tomate y el chile en polvo y cocine por 5 minutos, revolviendo, hasta que espese.",
      "Agregue las papas, el agua y la sal, tape y cocine a fuego lento de 15 a 18 minutos, hasta que las papas estén suaves.",
      "Agregue los chícharos y cocine por 3 minutos, hasta que estén calientes.",
      "Pruebe de sal y sirva.",
    ],
    notes: {
      potato: "medianas, peladas y cortadas en cubitos",
      onion: "picada finamente",
      "canned-peas": "escurridos",
    },
  },
  haluski: {
    title: "Haluski (fideos con repollo)",
    blurb:
      "Fideos de huevo mezclados con repollo y cebolla fritos despacio en mantequilla. Un plato casero de Pensilvania que convierte un repollo en la cena.",
    steps: [
      "Derrita la mitad de la mantequilla en un sartén grande a fuego medio y cocine la cebolla por 5 minutos.",
      "Agregue el repollo y la sal y cocine de 15 a 20 minutos, revolviendo de vez en cuando, hasta que esté suave y dorado en partes.",
      "Mientras tanto, hierva los fideos en agua con sal según las instrucciones del paquete y escúrralos.",
      "Agregue los fideos y el resto de la mantequilla al sartén y mezcle por 2 minutos.",
      "Sazone con la pimienta y sirva.",
    ],
    tips: ["Para una versión más sustanciosa, agregue salchicha en rodajas junto con la cebolla."],
    notes: {
      noodles: "fideos de huevo anchos",
      onion: "en rodajas",
      cabbage: "pequeño, sin el corazón y en rebanadas",
    },
  },
  "black-bean-and-cheese-quesadilla": {
    title: "Quesadilla de frijoles negros con queso",
    blurb:
      "Una tortilla doblada y rellena de frijoles negros machacados, maíz y queso cheddar derretido, dorada en sartén. Un almuerzo de diez minutos.",
    steps: [
      "Machaque un poco los frijoles con el comino y una pizca de sal.",
      "Unte los frijoles sobre la mitad de cada tortilla y ponga encima el maíz y el queso.",
      "Doble las tortillas a la mitad.",
      "Caliente el aceite en un sartén a fuego medio y cocine las quesadillas de 2 a 3 minutos por cada lado, hasta que se doren y el queso se derrita.",
      "Corte en triángulos y sirva con yogur para mojar.",
    ],
    notes: {
      "black-beans": "escurridos y enjuagados",
      tortillas: "grandes, de harina",
      "canned-corn": "escurrido",
      cheddar: "rallado",
      yogurt: "para servir",
    },
  },
  mujaddara: {
    title: "Mujaddara (lentejas con arroz y cebolla)",
    blurb:
      "Lentejas y arroz cocidos juntos, con cebolla bien dorada encima. Una cena del Medio Oriente hecha con tres ingredientes básicos y baratos.",
    steps: [
      "Ponga a hervir las lentejas con el agua en una olla y luego cocínelas a fuego lento por 15 minutos.",
      "Mientras tanto, caliente el aceite en un sartén a fuego medio y cocine las cebollas de 20 a 25 minutos, revolviendo seguido, hasta que estén bien doradas, casi cafés.",
      "Agregue a las lentejas, sin escurrirlas, el arroz, el comino, la sal, la pimienta y la mitad de las cebollas.",
      "Tape y cocine a fuego bajo de 18 a 20 minutos, hasta que el arroz esté suave y se absorba el líquido.",
      "Déjelo reposar tapado, fuera del fuego, por 5 minutos, y luego espónjelo con un tenedor.",
      "Ponga encima el resto de las cebollas y sirva con yogur.",
    ],
    notes: {
      lentils: "cafés o verdes, enjuagadas",
      onion: "grandes, en rodajas delgadas",
      rice: "de grano largo, enjuagado",
      yogurt: "para servir",
    },
  },
  "lentil-sloppy-joes": {
    title: "Sloppy Joes de lentejas",
    blurb:
      "Lentejas suaves en una salsa de tomate agridulce con pimiento y cebolla, servidas sobre pan tostado. Una versión sin carne de un clásico de cafetería.",
    steps: [
      "Cocine las lentejas en el agua en una olla a fuego lento de 20 a 25 minutos, hasta que estén suaves, y luego escúrralas.",
      "Caliente el aceite en un sartén a fuego medio y cocine la cebolla y el pimiento por 6 minutos, hasta que se suavicen.",
      "Agregue el ajo y revuelva por 30 segundos.",
      "Agregue el puré de tomate, la miel, el vinagre, el chile en polvo, la sal y la pimienta, revuelva y cocine a fuego lento por 5 minutos.",
      "Agregue las lentejas y cocine a fuego lento 5 minutos más, hasta que espese.",
      "Tueste el pan en el tostador y ponga la mezcla de lentejas encima con una cuchara.",
    ],
    notes: {
      lentils: "cafés o verdes, enjuagadas",
      onion: "picada",
      "bell-pepper": "picado",
      garlic: "picado finamente",
      bread: "o bolillos",
    },
  },
  "buffalo-chicken-wrap": {
    title: "Wrap de pollo búfalo",
    blurb:
      "Pollo enlatado mezclado con salsa picante y mantequilla, enrollado en una tortilla con lechuga, zanahoria y un aderezo fresco de yogur. Un almuerzo picante y rápido.",
    steps: [
      "Derrita la mantequilla en un tazón apto para microondas de 20 a 30 segundos y agregue la salsa picante, revolviendo.",
      "Agregue el pollo, mezcle para cubrirlo y caliéntelo en el microondas por 1 minuto, hasta que esté tibio.",
      "Mezcle el yogur con una pizca de sal y pimienta.",
      "Unte el aderezo de yogur por el centro de cada tortilla.",
      "Ponga encima la lechuga, la zanahoria, el pollo y el queso.",
      "Doble los lados hacia adentro, enrolle bien apretado y corte a la mitad.",
    ],
    notes: {
      "canned-chicken": "escurrido",
      tortillas: "grandes, de harina",
      lettuce: "picada en tiras finas",
      carrot: "rallada",
      cheddar: "rallado",
    },
  },
});

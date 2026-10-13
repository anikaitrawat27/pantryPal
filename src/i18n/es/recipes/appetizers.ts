import { defineRecipesEs } from "../../recipe-es";

export const APPETIZERS_ES = defineRecipesEs({
  "chicken-rollups": {
    title: "Rollitos de pollo",
    blurb:
      "Tortillas untadas con un relleno cremoso de pollo y queso, enrolladas y cortadas en rueditas. Buenos para una charola de fiesta o el almuerzo.",
    steps: [
      "Revuelva el queso crema en un tazón hasta que quede suave.",
      "Mezcle el queso rallado, el pollo, las hojas verdes, la sal y la pimienta.",
      "Unte el relleno en una capa pareja sobre cada tortilla, hasta las orillas.",
      "Enrolle cada tortilla bien apretada.",
      "Corte cada rollo en rueditas de un bocado y sirva.",
    ],
    tips: [
      "Envuelva los rollos y enfríelos 30 minutos antes de cortarlos para que las rueditas queden más parejas.",
      "Guarde lo que sobre tapado en el refrigerador hasta por 2 días.",
    ],
    notes: {
      "cream-cheese": "suavizado",
      cheese: "rallado",
      "canned-chicken": "escurrido y deshebrado, o use pollo cocido que le haya sobrado",
      greens: "picadas finamente",
      tortillas: "de harina, grandes",
    },
  },
  "mini-pizza-bites": {
    title: "Mini bocados de pizza",
    blurb:
      "Triángulos de tortilla crujientes con salsa para pizza y queso mozzarella derretido. Un bocadillo rápido para cuando se le antoja pizza sin esperar.",
    steps: [
      "Corte cada tortilla en 6 triángulos.",
      "Tueste los triángulos en un sartén seco a fuego medio de 1 a 2 minutos por lado, hasta que estén crujientes.",
      "Unte un poco de salsa en cada triángulo.",
      "Cubra con el queso, el pimiento y las hierbas italianas.",
      "Regrese los triángulos al sartén, tape y cocine a fuego bajo de 2 a 3 minutos, hasta que el queso se derrita.",
      "O acomode los triángulos ya cubiertos en un plato y caliéntelos en el microondas de 30 a 45 segundos, hasta que el queso se derrita.",
    ],
    tips: ["También puede ponerles salchicha de hot dog picada, salchicha cocida o cebolla."],
    notes: {
      tortillas: "de harina o de maíz",
      mozzarella: "rallado",
      "bell-pepper": "picado finamente",
    },
  },
  "loaded-nachos": {
    title: "Nachos cargados",
    blurb:
      "Un platón vegetariano de totopos cubiertos con queso derretido, maíz y frijoles negros, con yogur fresco encima. Para compartir en noche de partido.",
    steps: [
      "Extienda los totopos en un plato grande apto para microondas.",
      "Mezcle el maíz y los frijoles en un tazón y caliéntelos en el microondas de 1 a 2 minutos, hasta que estén tibios.",
      "Ponga el queso y la leche en otro tazón y caliéntelos en el microondas por 90 segundos, revolviendo cada 30 segundos, hasta que quede suave.",
      "Vierta el queso caliente sobre los totopos.",
      "Reparta el maíz, los frijoles y el tomate encima.",
      "Agregue cucharadas de yogur y unas gotas de salsa picante, y sirva de inmediato.",
    ],
    tips: ["Mezcle una pizca de chile en polvo con el yogur para darle un poco de picor."],
    notes: {
      chips: "totopos de tortilla",
      cheddar: "rallado",
      "canned-corn": "escurrido",
      "black-beans": "escurridos y enjuagados",
      tomato: "picado",
      yogurt: "natural",
    },
  },
  "meaty-nachos": {
    title: "Nachos con pollo",
    blurb:
      "Totopos con queso derretido y pollo enlatado deshebrado, calentados en dos tandas rápidas en el microondas. Un bocadillo que llena, para dos personas.",
    steps: [
      "Extienda los totopos en un plato apto para microondas.",
      "Espolvoree el queso sobre los totopos.",
      "Caliente en el microondas de 20 a 30 segundos, hasta que el queso empiece a derretirse.",
      "Cubra con el pollo, el tomate y la salsa picante.",
      "Caliente en el microondas otros 20 a 30 segundos, hasta que la carne esté caliente.",
      "Si quiere, ponga una cucharada de yogur encima y sirva.",
    ],
    notes: {
      cheese: "rallado",
      "canned-chicken": "escurrido y deshebrado",
      tomato: "picado",
    },
  },
  "veggie-chips": {
    title: "Papitas caseras",
    blurb:
      "Rebanadas delgadas de papa que se doran en el microondas en tandas pequeñas, con sal y un poco de aceite. Papitas hechas en casa para la tarde.",
    steps: [
      "Rebane las papas lo más delgado que pueda con un cuchillo o un pelador de verduras.",
      "Enjuague las rebanadas en agua fría y séquelas muy bien con una toalla.",
      "Mezcle las rebanadas con el aceite y la sal.",
      "Acomode una tanda en una sola capa sobre un plato apto para microondas cubierto con papel pergamino.",
      "Cocine en el microondas a potencia alta por 3 minutos y luego voltee las rebanadas.",
      "Siga en el microondas en intervalos de 30 segundos hasta que estén doradas y crujientes, de 1 a 3 minutos más.",
      "Pase las papitas a una rejilla o una toalla para que se enfríen, y repita con el resto de las rebanadas.",
      "O cocine todas las rebanadas en la freidora de aire a 360°F de 12 a 16 minutos, sacudiendo la canasta cada 4 minutos.",
    ],
    tips: [
      "Las papitas se ponen más crujientes al enfriarse, así que sáquelas en cuanto se doren.",
      "Las rebanadas más delgadas se cocinan más rápido; vigile de cerca la última tanda.",
    ],
    notes: { potato: "medianas" },
  },
  "potato-puffs": {
    title: "Panecitos rellenos de papa",
    blurb:
      "Masa suave de yogur rellena de puré de papa sazonado y dorada en sartén, como un pan plano relleno pequeño. Un bocadillo que llena, para servir caliente.",
    steps: [
      "Hierva las papas en una olla con agua con sal de 12 a 15 minutos, hasta que estén suaves.",
      "Escurra las papas y macháquelas con la mitad de la sal, el comino y el chile en polvo. Deje que el relleno se enfríe.",
      "Mezcle la harina, el polvo para hornear y el resto de la sal en un tazón.",
      "Agregue el yogur y amase por 2 minutos, hasta formar una masa suave. Agregue un poco de harina si se pega.",
      "Divida la masa y el relleno en 4 porciones cada uno.",
      "Extienda un pedazo de masa en un círculo pequeño, ponga una porción de relleno en el centro y junte las orillas pellizcándolas para cerrar.",
      "Aplane cada panecito con cuidado con la palma de la mano hasta que tenga más o menos el tamaño de su mano.",
      "Caliente un poco del aceite en un sartén a fuego medio-bajo.",
      "Cocine los panecitos tapados de 3 a 4 minutos por lado, agregando aceite si hace falta, hasta que estén dorados y bien cocidos por dentro.",
      "Sirva calientes.",
    ],
    tips: ["Sirva con yogur natural para mojar."],
    notes: {
      potato: "medianas, peladas y en cubos",
      salt: "dividida",
      flour: "y un poco más para extender la masa",
      yogurt: "natural",
    },
  },
  "classic-deviled-eggs": {
    title: "Huevos rellenos clásicos",
    blurb:
      "Mitades de huevo duro rellenas de una mezcla cremosa y sazonada de yema. Una botana que puede preparar con anticipación para reuniones y días festivos.",
    steps: [
      "Ponga los huevos en una olla y cúbralos con agua fría.",
      "Deje que hierva a fuego alto, luego tape la olla y retírela del fuego.",
      "Deje reposar los huevos por 12 minutos.",
      "Pase los huevos a un tazón con agua fría y déjelos enfriar por 5 minutos.",
      "Pele los huevos y córtelos por la mitad a lo largo.",
      "Saque las yemas a un tazón y macháquelas con la mayonesa, el vinagre, la sal y la pimienta hasta que quede suave.",
      "Rellene las claras con la mezcla de yema usando una cuchara.",
      "Espolvoree con pimentón y sirva, o enfríe en el refrigerador hasta la hora de comer.",
    ],
    tips: ["Guarde los huevos tapados en el refrigerador y cómalos dentro de 2 días."],
  },
  "warm-bean-dip": {
    title: "Dip caliente de frijoles",
    blurb:
      "Frijoles pintos machacados con comino y chile en polvo bajo una capa de queso derretido. Sírvalo caliente con totopos en una fiesta o noche de películas.",
    steps: [
      "Machaque los frijoles con un tenedor en un tazón apto para microondas, agregando un chorrito del líquido que guardó hasta que queden suaves y fáciles de servir.",
      "Incorpore el chile en polvo, el comino, la sal y la mitad del queso.",
      "Empareje la superficie y espolvoree el resto del queso encima.",
      "Tape y caliente en el microondas por 2 minutos, revolviendo a la mitad, hasta que esté caliente y el queso se derrita.",
      "Agregue salsa picante al gusto y sirva con los totopos.",
    ],
    notes: {
      "pinto-beans": "escurridos, guarde el líquido",
      cheddar: "rallado",
      chips: "para servir",
    },
  },
  "chickpea-hummus": {
    title: "Hummus de garbanzo",
    blurb:
      "Una pasta suave de garbanzo hecha con crema de cacahuate en lugar de tahini. Sírvala con triángulos de tortilla, totopos o palitos de zanahoria.",
    steps: [
      "Ponga los garbanzos, la crema de cacahuate, el aceite, el ajo, el jugo de limón, el comino y la sal en la licuadora.",
      "Licúe hasta que quede suave, deteniéndose para bajar lo que se pegue a los lados.",
      "Agregue el agua poco a poco, o un poco del líquido de los garbanzos que guardó, hasta que quede cremoso.",
      "Pruebe y agregue más sal si hace falta.",
      "Sirva en un tazón y, si quiere, rocíe con un poco más de aceite.",
    ],
    tips: ["Se conserva tapado en el refrigerador hasta por 4 días.", "Espolvoree con pimentón antes de servir."],
    notes: { chickpeas: "escurridos, guarde el líquido" },
  },
  "fresh-tomato-salsa": {
    title: "Salsa fresca de tomate",
    blurb:
      "Tomate, cebolla y ajo picados con un chorrito de limón. Una salsa fresca para totopos o para poner encima de quesadillas y huevos.",
    steps: [
      "Mezcle los tomates, la cebolla y el ajo en un tazón.",
      "Agregue el jugo de limón, la salsa picante y la sal, y vuelva a mezclar.",
      "Deje reposar la salsa por 10 minutos para que los sabores se integren.",
      "Sirva con los totopos.",
    ],
    tips: ["Agregue maíz enlatado escurrido o frijoles negros para una salsa con más cuerpo."],
    notes: {
      tomato: "picado",
      onion: "picada finamente",
      garlic: "picado finamente",
      chips: "para servir",
    },
  },
  "stovetop-queso-dip": {
    title: "Dip de queso en la estufa",
    blurb:
      "Una salsa de queso suave y caliente con tomate picado y un poco de chile en polvo. Sírvala con totopos cuando tenga muchos invitados.",
    steps: [
      "Derrita la mantequilla en una cacerola pequeña a fuego medio-bajo.",
      "Agregue la harina batiendo y cocine por 1 minuto.",
      "Agregue la leche poco a poco sin dejar de batir y deje hervir a fuego lento de 2 a 3 minutos, hasta que espese un poco.",
      "Baje el fuego y agregue el queso poco a poco, revolviendo hasta que cada parte se derrita.",
      "Incorpore los tomates, el chile en polvo, el comino y la sal.",
      "Sirva caliente con los totopos.",
    ],
    tips: ["Si el dip se espesa al reposar, agregue un chorrito de leche y revuelva a fuego bajo."],
    notes: {
      cheddar: "rallado",
      "diced-tomatoes": "escurrido",
      chips: "para servir",
    },
  },
  "pigs-in-a-blanket": {
    title: "Salchichas envueltas",
    blurb:
      "Pedazos de salchicha de hot dog envueltos en tiras de masa de bisquets y cocidos en un sartén tapado hasta dorarse. Un bocadillo de fiesta que gusta a niños y adultos.",
    steps: [
      "Desenrolle la masa y separe los triángulos.",
      "Corte cada triángulo por la mitad a lo largo para hacer tiras delgadas.",
      "Corte cada salchicha en 4 pedazos.",
      "Envuelva cada pedazo de salchicha con una tira de masa y pellizque la punta para cerrar.",
      "Caliente el aceite en un sartén a fuego medio-bajo.",
      "Ponga los pedazos envueltos con la unión hacia abajo, tape y cocine de 4 a 5 minutos por lado, hasta que estén dorados y la masa esté bien cocida.",
      "O cocínelos en la freidora de aire a 350°F de 8 a 10 minutos, hasta que estén dorados.",
    ],
    tips: ["Revise abriendo uno; la masa por dentro debe estar esponjosa, no húmeda."],
    notes: { "biscuit-dough": "masa de cuernitos (crescent)" },
  },
  "cheese-quesadilla-triangles": {
    title: "Triángulos de quesadilla",
    blurb:
      "Tortillas crujientes dobladas sobre queso derretido y cortadas en triángulos pequeños para mojar. Rápidas de hacer como bocadillo después de la escuela.",
    steps: [
      "Espolvoree el queso y el chile en polvo sobre la mitad de cada tortilla.",
      "Doble las tortillas por la mitad.",
      "Derrita la mantequilla en un sartén a fuego medio.",
      "Cocine las quesadillas de 2 a 3 minutos por lado, hasta que estén doradas y el queso se derrita.",
      "Corte cada una en 4 triángulos.",
      "Sirva con yogur para mojar.",
    ],
    tips: ["Sirva con Salsa fresca de tomate."],
    notes: {
      tortillas: "de harina",
      cheese: "rallado",
      yogurt: "para mojar",
    },
  },
  "potato-latkes": {
    title: "Latkes de papa",
    blurb:
      "Tortitas de papa y cebolla ralladas, fritas en sartén hasta que las orillas quedan crujientes. Sírvalas calientes con yogur o puré de manzana como botana o entrada.",
    steps: [
      "Ralle las papas y la cebolla por el lado grueso del rallador.",
      "Envuélvalas en una toalla limpia y exprima todo el líquido que pueda.",
      "Mezcle la papa y la cebolla con el huevo, la harina, la sal y la pimienta.",
      "Caliente el aceite en un sartén grande a fuego medio-alto hasta que brille.",
      "Ponga cucharadas de la mezcla, separadas entre sí, y aplane cada una con una espátula.",
      "Fríalas de 3 a 4 minutos por lado, hasta que estén bien doradas y crujientes.",
      "Escúrralas sobre toallas de papel y sírvalas calientes con yogur.",
    ],
    tips: [
      "Baje los latkes al aceite con cuidado y alejándolos de usted, porque el aceite caliente puede salpicar.",
      "Mantenga calientes los latkes ya listos en un plato tapado con una toalla mientras cocina los demás.",
    ],
    notes: {
      potato: "grandes, peladas",
      yogurt: "para servir",
    },
  },
  "onion-pakoras": {
    title: "Pakoras de cebolla",
    blurb:
      "Cebolla rebanada en una masa de harina con especias, frita en montoncitos hasta quedar crujiente. Un antojito callejero para una tarde de lluvia con té.",
    steps: [
      "Mezcle la harina, el polvo para hornear, la sal, el chile en polvo y el comino en un tazón.",
      "Agregue la pasta de ajo y jengibre y la cebolla, y revuelva para cubrir.",
      "Incorpore el agua poco a poco hasta que una masa espesa se pegue a la cebolla.",
      "Caliente el aceite en un sartén a fuego medio hasta que una gota de masa chisporrotee de inmediato.",
      "Baje montoncitos de cebolla con masa al aceite con una cuchara.",
      "Fríalos de 3 a 4 minutos, volteándolos una vez, hasta que estén dorados y crujientes.",
      "Escúrralos sobre toallas de papel y sirva calientes.",
    ],
    tips: [
      "Cocine en tandas pequeñas para que el aceite se mantenga caliente, y deje el mango del sartén volteado hacia adentro, lejos de la orilla de la estufa.",
      "Sirva con yogur mezclado con una pizca de sal.",
    ],
    notes: { onion: "en rebanadas delgadas" },
  },
  "onion-scallion-style-pancakes": {
    title: "Panqueques de cebolla estilo chino",
    blurb:
      "Panes planos hojaldrados, fritos en sartén y con capas de cebolla picada fina, cortados en triángulos y para mojar en salsa de soya. Un bocadillo estilo chino hecho con harina de la despensa.",
    steps: [
      "Mezcle la harina y la mitad de la sal en un tazón.",
      "Incorpore el agua caliente hasta que se forme una masa grumosa.",
      "Amase por 3 minutos, hasta que esté suave, luego tápela y déjela reposar 20 minutos.",
      "Divida la masa a la mitad y extienda cada pedazo en un círculo delgado.",
      "Barnice cada círculo con un poco de aceite y espolvoree la cebolla y el resto de la sal.",
      "Enrolle cada círculo en un tubo apretado, enróllelo en espiral y vuelva a aplanarlo con el rodillo.",
      "Caliente un poco de aceite en un sartén a fuego medio.",
      "Cocine cada panqueque de 3 a 4 minutos por lado, hasta que esté dorado y crujiente.",
      "Córtelos en triángulos.",
      "Mezcle la salsa de soya y el vinagre para mojar, y sirva.",
    ],
    notes: {
      flour: "y un poco más para extender la masa",
      salt: "dividida",
      water: "recién hervida",
      oil: "dividido",
      onion: "picada muy finamente",
    },
  },
  "cabbage-okonomiyaki": {
    title: "Okonomiyaki de repollo",
    blurb:
      "Una tortita salada japonesa llena de repollo rallado, con mayonesa y un glaseado dulce de soya encima. Córtela en triángulos para compartir.",
    steps: [
      "Bata la harina, los huevos, el agua y la sal en un tazón hasta que quede suave.",
      "Incorpore el repollo y la cebolla con movimientos envolventes hasta cubrirlos.",
      "Caliente el aceite en un sartén a fuego medio-bajo.",
      "Extienda la mezcla en un solo círculo grueso y tape el sartén.",
      "Cocine de 5 a 6 minutos, hasta que la parte de abajo esté dorada.",
      "Voltee con una espátula ancha, tape de nuevo y cocine de 5 a 6 minutos, hasta que el centro esté firme y sin masa cruda.",
      "Mezcle la salsa de soya y la miel y barnice la parte de arriba.",
      "Rocíe con la mayonesa y corte en triángulos.",
    ],
    tips: ["Agregue salchicha cocida en rebanadas a la mezcla para una tortita más sustanciosa."],
    notes: {
      cabbage: "rallado finamente",
      onion: "en rebanadas delgadas",
    },
  },
  "vegetable-pajeon": {
    title: "Pajeon de verduras",
    blurb:
      "Una tortita coreana delgada y crujiente llena de cebolla y zanahoria, con salsa de soya y vinagre para mojar. Buena para compartir al empezar la comida.",
    steps: [
      "Bata la harina, el agua, el huevo y la sal hasta formar una mezcla suave y aguada.",
      "Incorpore la cebolla, la zanahoria y las hojas verdes.",
      "Caliente la mitad del aceite en un sartén grande a fuego medio-alto.",
      "Vierta la mitad de la mezcla y extiéndala en una capa delgada y pareja.",
      "Cocine de 3 a 4 minutos, hasta que la parte de abajo esté crujiente y dorada.",
      "Voltee y cocine de 2 a 3 minutos más, presionando con la espátula.",
      "Repita con el resto del aceite y de la mezcla.",
      "Mezcle la salsa de soya, el vinagre y el azúcar para mojar.",
      "Corte las tortitas en cuadros y sirva con la salsa.",
    ],
    notes: {
      water: "fría",
      onion: "en rebanadas delgadas",
      carrot: "en tiras delgadas como cerillos",
      greens: "picadas",
      oil: "dividido",
    },
  },
  "patatas-bravas": {
    title: "Patatas Bravas",
    blurb:
      "Cubos de papa fritos en sartén hasta quedar crujientes, con una salsa de tomate con pimentón ahumado. Una tapa española para compartir con palillos.",
    steps: [
      "Hierva las papas en una olla con agua con sal de 6 a 8 minutos, hasta que apenas estén tiernas.",
      "Escúrralas bien y séquelas con una toalla.",
      "Caliente casi todo el aceite en un sartén grande a fuego medio-alto.",
      "Fría las papas de 10 a 12 minutos, volteándolas seguido, hasta que estén crujientes por todos lados. Sazone con sal.",
      "Mientras tanto, caliente el resto del aceite en una cacerola pequeña a fuego medio y cocine el ajo por 1 minuto.",
      "Incorpore el pimentón y el chile en polvo y revuelva por 30 segundos.",
      "Agregue el puré de tomate y deje hervir a fuego lento por 5 minutos; luego incorpore el vinagre y una pizca de sal.",
      "Bañe las papas con la salsa y rocíe con la mayonesa.",
    ],
    notes: {
      potato: "medianas, en cubos pequeños",
      oil: "dividido",
      garlic: "picado finamente",
    },
  },
  "street-corn-cups": {
    title: "Vasitos de esquites",
    blurb:
      "Maíz tostado en sartén y mezclado con mayonesa, queso parmesano y chile en polvo, servido en vasitos. Una versión de los esquites mexicanos con maíz enlatado.",
    steps: [
      "Derrita la mantequilla en un sartén a fuego medio-alto.",
      "Agregue el maíz en una capa pareja y cocine de 5 a 7 minutos, revolviendo solo de vez en cuando, hasta que algunos granos se doren.",
      "Retire el sartén del fuego e incorpore la mayonesa, el jugo de limón y la sal.",
      "Sirva en vasitos.",
      "Cubra con el queso parmesano y el chile en polvo, y sirva caliente.",
    ],
    notes: {
      "canned-corn": "escurrido y secado con una toalla",
      parmesan: "rallado",
    },
  },
  "tuna-stuffed-tomatoes": {
    title: "Tomates rellenos de atún",
    blurb:
      "Tomates vaciados y rellenos de atún, cebolla, aceite y limón. Una entrada ligera sin cocinar, o un almuerzo para un día caluroso.",
    steps: [
      "Corte la parte de arriba de los tomates.",
      "Saque las semillas y el centro suave con una cuchara, y pique la pulpa que sacó.",
      "Mezcle el atún, el tomate picado, la cebolla, el aceite, el jugo de limón, las hierbas italianas, la sal y la pimienta en un tazón.",
      "Rellene los tomates con la mezcla usando una cuchara, presionando con cuidado.",
      "Sirva de inmediato o enfríe en el refrigerador hasta por 2 horas.",
    ],
    tips: ["Agregue una cucharada de mayonesa para un relleno más cremoso."],
    notes: {
      tomato: "medianos",
      "canned-tuna": "escurrido",
      onion: "picada finamente",
    },
  },
  "parmesan-cheese-crisps": {
    title: "Galletitas crujientes de parmesano",
    blurb:
      "Círculos crujientes y calados de queso parmesano derretido, hechos en el microondas en unos dos minutos. Un bocadillo salado solo o encima de una sopa.",
    steps: [
      "Cubra un plato apto para microondas con papel pergamino.",
      "Ponga montoncitos de queso sobre el papel, bien separados entre sí.",
      "Espolvoree con las hierbas italianas y la pimienta.",
      "Caliente en el microondas a potencia alta de 1 a 2 minutos, hasta que el queso deje de burbujear y tome un color dorado claro.",
      "Deje enfriar en el plato por 1 minuto para que se pongan crujientes, y luego despéguelas del papel.",
      "Repita con el resto del queso.",
    ],
    notes: { parmesan: "rallado grueso o fino" },
  },
  "cinnamon-sugar-tortilla-chips": {
    title: "Totopos con canela y azúcar",
    blurb:
      "Triángulos de tortilla de harina tostados hasta quedar crujientes y revueltos con azúcar y canela. Un bocadillo dulce para mojar en yogur o comer a puños.",
    steps: [
      "Mezcle el azúcar y la canela en un tazón grande.",
      "Barnice ligeramente ambos lados de cada tortilla con aceite.",
      "Corte cada tortilla en 8 triángulos.",
      "Tueste los triángulos en una sola capa en un sartén seco a fuego medio de 1 a 2 minutos por lado, hasta que estén crujientes y con manchas doradas.",
      "O cocínelos en la freidora de aire a 350°F de 5 a 6 minutos, sacudiendo la canasta a la mitad.",
      "Revuelva los totopos calientes en el azúcar con canela y déjelos enfriar.",
    ],
    tips: ["Mójelos en yogur mezclado con un poco de miel."],
    notes: { tortillas: "de harina" },
  },
  "apple-ants-on-a-log": {
    title: "Hormiguitas en manzana",
    blurb:
      "Gajos de manzana untados con crema de cacahuate y salpicados de cereal, una versión del clásico bocadillo de apio. Los niños pueden ayudar a hacerlos rápido.",
    steps: [
      "Quite el corazón a las manzanas y corte cada una en 8 gajos.",
      "Revuelva los gajos con el jugo de limón para que no se pongan oscuros.",
      "Unte crema de cacahuate a lo largo del borde de arriba de cada gajo.",
      "Presione una hilera de cereal sobre la crema de cacahuate y sirva.",
    ],
    notes: { cereal: "de piezas pequeñas, como los aritos" },
  },
  "apple-nachos": {
    title: "Nachos de manzana",
    blurb:
      "Rebanadas delgadas de manzana extendidas en un plato y bañadas con crema de cacahuate tibia y miel. Un platón dulce fácil de compartir.",
    steps: [
      "Quite el corazón a las manzanas y córtelas en rebanadas delgadas.",
      "Acomode las rebanadas encimadas en un plato.",
      "Caliente la crema de cacahuate en un tazón pequeño en el microondas de 15 a 20 segundos, hasta que esté líquida.",
      "Rocíe la crema de cacahuate y la miel sobre las manzanas.",
      "Espolvoree con la avena y la canela, y sirva de inmediato.",
    ],
  },
  "peanut-butter-energy-bites": {
    title: "Bolitas energéticas de crema de cacahuate",
    blurb:
      "Bolitas masticables sin cocinar de avena, crema de cacahuate y miel. Prepare una tanda con anticipación para la escuela o para comer algo rápido al salir.",
    steps: [
      "Mezcle todos los ingredientes en un tazón hasta que queden bien integrados.",
      "Enfríe la mezcla en el refrigerador por 20 minutos para que sea más fácil darle forma.",
      "Forme bolitas pequeñas con las manos.",
      "Guárdelas en un recipiente tapado en el refrigerador.",
    ],
    tips: ["Se conservan en el refrigerador hasta por una semana."],
    notes: { cereal: "ligeramente triturado" },
  },
  "glazed-sausage-bites": {
    title: "Bocados de salchicha glaseada",
    blurb:
      "Rodajas de salchicha doradas y revueltas en un glaseado pegajoso de miel y soya. Sírvalas con palillos en una fiesta o noche de partido.",
    steps: [
      "Caliente el aceite en un sartén a fuego medio.",
      "Agregue la salchicha y cocine de 5 a 6 minutos, volteándola, hasta que esté dorada y bien cocida, sin partes rosadas en el centro.",
      "Mezcle la miel, la salsa de soya, la pasta de ajo y jengibre y la salsa picante.",
      "Vierta el glaseado en el sartén y deje hervir a fuego lento de 1 a 2 minutos, revolviendo, hasta que esté pegajoso.",
      "Sirva caliente con palillos.",
    ],
    notes: { sausage: "en tripa, cortada en rodajas" },
  },
  "mini-corn-fritters": {
    title: "Mini tortitas de elote",
    blurb:
      "Tortitas pequeñas y doradas, fritas en sartén y llenas de maíz dulce. Sírvalas calientes con yogur o salsa como botana o entrada.",
    steps: [
      "Bata la harina, el polvo para hornear y la sal en un tazón.",
      "Agregue el huevo y la leche y revuelva hasta formar una masa espesa.",
      "Incorpore el maíz, la cebolla y el queso con movimientos envolventes.",
      "Caliente el aceite en un sartén a fuego medio.",
      "Ponga cucharaditas de masa en el sartén y aplánelas un poco.",
      "Fríalas de 2 a 3 minutos por lado, hasta que estén doradas y bien cocidas por dentro.",
      "Escúrralas sobre toallas de papel y sirva calientes.",
    ],
    tips: ["Agregue una pizca de chile en polvo a la masa para darle un poco de picor."],
    notes: {
      "canned-corn": "escurrido",
      onion: "picada finamente",
      cheddar: "rallado",
    },
  },
  "crispy-spiced-chickpeas": {
    title: "Garbanzos crujientes con especias",
    blurb:
      "Garbanzos enlatados tostados en sartén con pimentón y comino hasta quedar crujientes. Un bocadillo salado para tener en un tazón y picar.",
    steps: [
      "Caliente el aceite en un sartén grande a fuego medio.",
      "Agregue los garbanzos en una sola capa y cocine de 12 a 15 minutos, sacudiendo el sartén seguido, hasta que estén dorados y crujientes.",
      "O revuelva los garbanzos con el aceite y cocínelos en la freidora de aire a 390°F de 12 a 15 minutos, sacudiendo la canasta cada pocos minutos.",
      "Revuelva los garbanzos calientes con el pimentón, el comino, el chile en polvo y la sal.",
      "Déjelos enfriar unos minutos antes de comerlos; se ponen más crujientes al enfriarse.",
    ],
    tips: ["Cómalos el mismo día; se ablandan de un día para otro."],
    notes: { chickpeas: "escurridos, enjuagados y muy bien secados" },
  },
  "chickpea-falafel-patties": {
    title: "Falafel de garbanzo",
    blurb:
      "Tortitas pequeñas de garbanzo con ajo, cebolla y comino, fritas en sartén hasta quedar crujientes y servidas con una salsa de yogur con limón.",
    steps: [
      "Pulse los garbanzos, la cebolla, el ajo, las hojas verdes, el comino y casi toda la sal en la licuadora hasta que la mezcla esté martajada y se mantenga unida al apretarla. Baje lo que se pegue a los lados cuando haga falta.",
      "Pase la mezcla a un tazón e incorpore la harina y el polvo para hornear.",
      "Forme tortitas pequeñas y planas.",
      "Caliente el aceite en un sartén a fuego medio.",
      "Fría las tortitas de 3 a 4 minutos por lado, hasta que estén bien doradas y calientes por dentro.",
      "Escúrralas sobre toallas de papel.",
      "Mezcle el yogur, el jugo de limón y el resto de la sal, y sirva con las tortitas.",
    ],
    tips: [
      "Si la mezcla está muy blanda para darle forma, enfríela 15 minutos en el refrigerador o agregue un poco más de harina.",
    ],
    notes: {
      chickpeas: "escurridos y secados con una toalla",
      onion: "picada",
      greens: "bien apretadas, como espinaca",
      salt: "dividida",
    },
  },
});

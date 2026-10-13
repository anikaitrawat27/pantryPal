import { defineRecipesEs } from "../../recipe-es";

export const DRINKS_ES = defineRecipesEs({
  "orange-refresher": {
    title: "Refresco de naranja",
    blurb:
      "Una bebida de naranja un poco ácida y ligeramente dulce para una tarde de calor. Machaque una naranja fresca, revuelva y sirva con hielo.",
    steps: [
      "Separe la naranja en gajos y macháquelos en un tazón con un tenedor hasta que suelten el jugo.",
      "Agregue el agua y el azúcar y revuelva hasta que el azúcar se disuelva.",
      "Sirva sobre hielo.",
    ],
    tips: ["Use la licuadora en lugar del tenedor para una bebida más suave."],
    notes: { orange: "grande, pelada" },
  },
  "very-berry-blend": {
    title: "Licuado de frutos rojos",
    blurb:
      "Frutos rojos licuados con yogur y un poco de leche hasta quedar un batido espeso y un poco ácido. Bueno para un desayuno rápido o una botana en la tarde.",
    steps: [
      "Ponga los frutos rojos, el yogur, el azúcar y el hielo en la licuadora.",
      "Licúe hasta que quede suave.",
      "Agregue la leche poco a poco, licuando otra vez hasta que tenga el espesor que le guste.",
      "Sirva en un vaso.",
    ],
    tips: ["Con frutos rojos congelados puede omitir el hielo para un licuado más espeso."],
    notes: { berries: "frescos o congelados" },
  },
  "orange-berry-lemonade": {
    title: "Limonada de naranja y fresa",
    blurb:
      "Naranja fresca y fresas machacadas en una limonada ácida. Un vaso rosado y afrutado para un día de calor.",
    steps: [
      "Separe la naranja en gajos y póngalos en un vaso grande o un frasco con las fresas.",
      "Machaque con un tenedor hasta que suelten el jugo.",
      "Agregue el jugo de limón y el azúcar y revuelva hasta que el azúcar se disuelva.",
      "Incorpore el agua.",
      "Sirva sobre hielo.",
    ],
    tips: ["Cuele la limonada si la prefiere sin pulpa."],
    notes: { orange: "pelada", strawberries: "sin tallo" },
  },
  "strawana-smoothie": {
    title: "Licuado de fresa y plátano",
    blurb:
      "La combinación clásica de fresas y plátano, licuada con yogur. Un licuado dulce y espeso para empezar el día.",
    steps: [
      "Parta el plátano en trozos y póngalo en la licuadora con las fresas, el yogur, el azúcar y el hielo.",
      "Licúe hasta que quede suave.",
      "Agregue la leche poco a poco, licuando otra vez hasta que tenga el espesor que le guste.",
      "Sirva en un vaso.",
    ],
    notes: { strawberries: "sin tallo, frescas o congeladas" },
  },
  "pink-lemonade": {
    title: "Limonada rosa",
    blurb:
      "Limonada dulce y ácida pintada de rosa con frambuesas machacadas. Sirven frambuesas frescas o congeladas.",
    steps: [
      "Ponga las frambuesas y el jugo de limón en un vaso grande o un frasco.",
      "Machaque las frambuesas con un tenedor hasta que no quede ninguna entera.",
      "Agregue el azúcar y revuelva hasta que se disuelva.",
      "Incorpore el agua.",
      "Sirva sobre hielo, o cuélela primero para una bebida sin pulpa.",
    ],
    notes: { raspberries: "frescas o congeladas" },
  },
  "peanut-butter-banana-smoothie": {
    title: "Licuado de plátano y crema de cacahuate",
    blurb:
      "Plátano, crema de cacahuate y leche licuados en un batido espeso que llena. Un desayuno que se puede tomar de camino a la puerta.",
    steps: [
      "Ponga el plátano, la crema de cacahuate, la leche, la avena, la miel y el hielo en la licuadora.",
      "Licúe por más o menos 1 minuto, hasta que quede completamente suave.",
      "Sirva en un vaso.",
    ],
    tips: ["Pele y congele en trozos los plátanos maduros para tenerlos listos para licuados."],
    notes: { banana: "congelado en trozos, si tiene" },
  },
  "frozen-fruit-milkshake": {
    title: "Malteada de fruta congelada",
    blurb:
      "Una malteada espesa y fría hecha con fruta congelada y leche en lugar de helado. Sirve cualquier bolsa de fruta congelada.",
    steps: [
      "Ponga la fruta congelada, la leche, el azúcar, el yogur y la vainilla en la licuadora.",
      "Licúe hasta que quede espesa y suave, deteniéndose para bajar lo que se pegue a los lados si la fruta se atora.",
      "Sirva en un vaso de inmediato.",
    ],
  },
  "green-smoothie": {
    title: "Licuado verde",
    blurb:
      "Hojas verdes licuadas con plátano y fruta congelada hasta que las hojas desaparecen. La fruta le da el sabor y las hojas le dan el color.",
    steps: [
      "Licúe las hojas verdes con la leche hasta que no queden pedacitos de hoja.",
      "Agregue el plátano, la fruta congelada y la miel.",
      "Licúe otra vez hasta que quede suave y espeso.",
      "Sirva en un vaso.",
    ],
    notes: { greens: "bien apretadas en la taza, como espinaca", milk: "o agua" },
  },
  "apple-pie-smoothie": {
    title: "Licuado de pay de manzana",
    blurb:
      "Manzana fresca, yogur, avena y canela licuados hasta que saben a relleno de pay de manzana. Un desayuno de otoño en un vaso.",
    steps: [
      "Ponga la manzana, el yogur, la leche, la avena, la miel, la canela, la vainilla y el hielo en la licuadora.",
      "Licúe de 1 a 2 minutos, hasta que la manzana quede completamente molida.",
      "Sirva en un vaso.",
    ],
    notes: { apple: "sin corazón y picada" },
  },
  "simmered-apple-cider": {
    title: "Sidra caliente de manzana",
    blurb:
      "Manzanas enteras cocidas a fuego lento con naranja y canela, y luego coladas para hacer una bebida caliente con especias. Deja la cocina oliendo a otoño.",
    steps: [
      "Ponga las manzanas, la naranja y la canela en una olla grande y cúbralas con el agua.",
      "Deje que hierva a fuego alto.",
      "Baje el fuego a bajo, tape y cocine a fuego lento por 1 hora, hasta que las manzanas estén muy suaves.",
      "Aplaste la fruta contra el lado de la olla con un machacador de papas o una cuchara grande.",
      "Cocine a fuego lento sin tapa 15 minutos más.",
      "Cuele con un colador fino, presionando la fruta para sacar todo el líquido.",
      "Agregue el azúcar, revuelva hasta que se disuelva y sirva caliente o fría.",
    ],
    tips: ["Puede usar peras en lugar de algunas o todas las manzanas."],
    notes: { apple: "en cuartos, sin pelar ni quitar el corazón", orange: "en cuartos" },
  },
  "orange-cream-smoothie": {
    title: "Licuado cremoso de naranja",
    blurb:
      "Naranja fresca licuada con yogur y vainilla, como una paleta de naranja con crema en un vaso. Fresco, cremoso y listo en cinco minutos.",
    steps: [
      "Separe la naranja en gajos y póngalos en la licuadora.",
      "Agregue el yogur, la leche, el azúcar, la vainilla y el hielo.",
      "Licúe hasta que quede suave y espumoso.",
      "Sirva en un vaso.",
    ],
    notes: { orange: "pelada y sin semillas" },
  },
  horchata: {
    title: "Horchata",
    blurb:
      "Una bebida mexicana de arroz, fría y cremosa, con sabor a canela. Ponga a remojar el arroz la noche anterior y licúelo en la mañana.",
    steps: [
      "Ponga el arroz y la canela en un tazón y vierta la mitad del agua, tan caliente como salga de la llave.",
      "Deje que se enfríe, luego tape y refrigere por lo menos 4 horas o toda la noche.",
      "Vierta el arroz con el agua del remojo en la licuadora y licúe por 2 minutos, hasta que el arroz esté bien molido.",
      "Cuele en una jarra con un colador fino cubierto con una toalla de papel o un trapo limpio.",
      "Agregue el resto del agua, el azúcar, la leche y la vainilla, y revuelva hasta que el azúcar se disuelva.",
      "Revuelva otra vez justo antes de servir sobre hielo.",
    ],
    tips: ["Guarde la horchata en el refrigerador hasta 3 días. Revuélvala antes de servir porque se asienta."],
    notes: { rice: "crudo, de grano largo" },
  },
  "strawberry-agua-fresca": {
    title: "Agua fresca de fresa",
    blurb:
      "Fresas frescas licuadas con agua y un poco de azúcar para hacer una bebida mexicana de fruta ligera. Prepare una jarra para una tarde de calor.",
    steps: [
      "Ponga las fresas, el azúcar y la mitad del agua en la licuadora.",
      "Licúe hasta que quede completamente suave.",
      "Si quiere, cuele en una jarra para quitar las semillas.",
      "Agregue el resto del agua y el jugo de limón y revuelva.",
      "Pruebe y agregue más azúcar si hace falta.",
      "Sirva sobre hielo.",
    ],
    tips: ["Funciona igual con cualquier fruto rojo o con una pera madura."],
    notes: { strawberries: "sin tallo" },
  },
  "avena-warm-oat-drink": {
    title: "Avena (bebida caliente de avena)",
    blurb:
      "Una bebida mexicana espesa y dulce de avena cocida con leche y canela. Tómela caliente en una mañana fría.",
    steps: [
      "Junte la avena, el agua, la canela y la sal en una olla.",
      "Deje que suelte el hervor a fuego medio y cocine por 5 minutos, revolviendo seguido.",
      "Incorpore la leche y el azúcar.",
      "Caliente 5 minutos más, revolviendo, hasta que eche vapor y espese un poco. No deje que se derrame al hervir.",
      "Agregue la vainilla y sirva caliente en tazas.",
    ],
  },
  "licuado-de-platano-banana-shake": {
    title: "Licuado de plátano",
    blurb:
      "Un licuado mexicano de desayuno con plátano, leche y una pizca de canela. Se licúa rápido antes de la escuela o el trabajo.",
    steps: [
      "Parta el plátano en trozos y póngalo en la licuadora.",
      "Agregue la leche, el azúcar, la avena, la canela, la vainilla y el hielo.",
      "Licúe hasta que quede suave y espumoso.",
      "Sirva en un vaso.",
    ],
  },
  "sweet-lassi": {
    title: "Lassi dulce (bebida de yogur)",
    blurb:
      "Una bebida india de yogur, fría y espumosa, un poco endulzada. Sírvala con una comida picante o sola en un día de calor.",
    steps: [
      "Ponga el yogur, el agua, el azúcar y el hielo en la licuadora.",
      "Licúe por 30 segundos, hasta que quede suave y espumoso.",
      "Sirva en un vaso alto.",
    ],
    tips: ["Para un lassi de fruta, licúe también un plátano o un puñado de frutos rojos."],
    notes: { yogurt: "natural", water: "fría, o leche" },
  },
  ayran: {
    title: "Ayran (bebida salada de yogur)",
    blurb:
      "Una bebida de yogur salada y un poco ácida que se sirve fría en Turquía y el Medio Oriente. Acompaña bien la carne asada, el arroz o cualquier comida picante.",
    steps: [
      "Bata el yogur y la sal en un tazón hasta que quede uniforme.",
      "Agregue el agua poco a poco sin dejar de batir, y siga batiendo por 30 segundos, hasta que haga espuma.",
      "Sirva sobre hielo.",
    ],
    tips: ["Para una bebida con más espuma, agite todo en un frasco bien cerrado en lugar de batir."],
    notes: { yogurt: "natural", water: "fría" },
  },
  "korean-style-banana-milk": {
    title: "Leche de plátano estilo coreano",
    blurb:
      "Una versión casera de la leche de plátano dulce que se vende en las tiendas de conveniencia de Corea. Plátano maduro licuado con leche fría y un poco de miel.",
    steps: [
      "Parta el plátano en trozos y póngalo en la licuadora.",
      "Agregue la leche, la miel y la vainilla.",
      "Licúe por 1 minuto, hasta que quede completamente suave.",
      "Enfríe por 15 minutos o ponga sobre hielo, y sirva.",
    ],
    notes: { banana: "muy maduro", milk: "fría" },
  },
  "ichigo-milk-strawberry-milk": {
    title: "Ichigo milk (leche con fresa)",
    blurb:
      "Leche con fresa al estilo de las cafeterías de Japón: fresas picadas que reposan en azúcar hasta hacer un almíbar, con leche fría encima. Revuelva mientras la toma.",
    steps: [
      "Pique las fresas en trozos pequeños y póngalas en un tazón.",
      "Agregue el azúcar, revuelva y deje reposar por 15 minutos, hasta que las fresas suelten su jugo.",
      "Machaque un poco con un tenedor, dejando algunos trocitos.",
      "Ponga las fresas y su almíbar en un vaso.",
      "Vierta la leche fría y revuelva antes de tomar.",
    ],
    notes: { strawberries: "sin tallo", milk: "fría" },
  },
  "lemon-granizado": {
    title: "Granizado de limón",
    blurb:
      "Un raspado español de jugo de limón endulzado y hielo triturado. Sírvalo con cuchara en el día más caluroso del verano.",
    steps: [
      "Revuelva el azúcar en el agua hasta que se disuelva por completo.",
      "Incorpore el jugo de limón.",
      "Ponga el hielo en la licuadora y vierta la mezcla de limón encima.",
      "Licúe hasta que quede como raspado, sin pedazos grandes de hielo.",
      "Sirva con cuchara en vasos de inmediato.",
    ],
    tips: [
      "Sin licuadora, congele la mezcla de limón en un recipiente poco hondo y ráspela con un tenedor cada 30 minutos hasta que quede escarchada.",
    ],
  },
  "lait-chaud-au-miel-warm-honey-milk": {
    title: "Lait chaud au miel (leche caliente con miel)",
    blurb:
      "Leche caliente endulzada con miel, una bebida francesa para antes de dormir, para niños y adultos. Prepárela en una noche fría o cuando no pueda dormir.",
    steps: [
      "Caliente la leche en una olla pequeña a fuego medio-bajo de 3 a 4 minutos, hasta que eche vapor. No deje que hierva.",
      "O caliéntela en una taza apta para microondas de 1 a 2 minutos.",
      "Agregue la miel y la vainilla y revuelva hasta que la miel se disuelva.",
      "Sirva en una taza y espolvoree con canela, si la usa.",
    ],
  },
  "pear-frullato": {
    title: "Frullato de pera (licuado italiano)",
    blurb:
      "Un licuado italiano de fruta y leche hecho con peras maduras. Más ligero que una malteada y listo en pocos minutos.",
    steps: [
      "Ponga las peras, la leche, el azúcar, la vainilla y el hielo en la licuadora.",
      "Licúe hasta que quede suave y espumoso.",
      "Sirva en vasos de inmediato.",
    ],
    tips: ["El frullato también se puede hacer con fresas, plátano o una mezcla de frutas."],
    notes: { pear: "maduras, sin corazón y picadas", milk: "fría" },
  },
  "nam-manao-thai-lemon-drink": {
    title: "Nam manao (limonada tailandesa)",
    blurb:
      "Una bebida de puesto callejero de Tailandia, ácida, dulce y un poco salada, servida con mucho hielo. Se hace con jugo de limón embotellado.",
    steps: [
      "Disuelva el azúcar y la sal en un chorrito de agua tibia de la llave.",
      "Agregue el jugo de limón y el resto del agua y revuelva.",
      "Pruebe y ajuste. Primero debe saber ácida, luego dulce, con un toque de sal.",
      "Sirva en un vaso lleno de hielo.",
    ],
  },
  "jamaican-carrot-juice": {
    title: "Jugo de zanahoria jamaiquino",
    blurb:
      "Zanahorias frescas licuadas y coladas, endulzadas con azúcar, leche y vainilla. Una bebida cremosa muy querida en Jamaica que se sirve bien fría.",
    steps: [
      "Ponga las zanahorias y el agua en la licuadora.",
      "Licúe a velocidad alta de 1 a 2 minutos, hasta que quede lo más suave posible.",
      "Cuele en una jarra con un colador fino o un trapo limpio, presionando para sacar todo el jugo.",
      "Agregue la leche, el azúcar, la vainilla y la canela, y revuelva hasta que el azúcar se disuelva.",
      "Enfríe y sirva sobre hielo.",
    ],
    notes: { carrot: "peladas y picadas" },
  },
  "peanut-punch": {
    title: "Ponche de cacahuate",
    blurb:
      "Un batido espeso del Caribe con crema de cacahuate, leche y un poco de especias. Es popular en Trinidad y Jamaica como bebida de desayuno que llena.",
    steps: [
      "Ponga la crema de cacahuate, la leche, el azúcar, la avena, la vainilla, la canela y el hielo en la licuadora.",
      "Licúe por 1 minuto, hasta que quede suave y espumoso.",
      "Sirva en vasos.",
    ],
    notes: { milk: "fría" },
  },
});

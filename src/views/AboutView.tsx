import Link from "next/link";
import { localePath, type Lang } from "@/i18n/config";
import { RECIPES } from "@/lib/catalog";
import styles from "./AboutView.module.css";

export function AboutView({ lang }: { lang: Lang }) {
  const href = (p: string) => localePath(lang, p);
  const n = RECIPES.length;
  if (lang === "es") {
    return (
      <div className={`container ${styles.about}`} lang="es">
        <h1>
          <span className="highlight">Acerca de Pantry Pal</span>
        </h1>
        <p>
          Los bancos de comida reparten un surtido bastante predecible: verduras y frijoles enlatados, arroz, pasta, crema de cacahuate, huevos,
          leche y algo de fruta y verdura fresca. Lo difícil es saber qué cocinar con eso. Pantry Pal reúne {n} recetas que usan solo esos
          ingredientes, para que una bolsa del banco de comida se convierta en desayuno, almuerzo, cena y postre.
        </p>

        <h2>Cómo funcionan las recetas</h2>
        <p>
          Cada receta se limita a la <Link href={href("/pantry")}>lista de la despensa</Link>. Se da por hecho que tiene agua y hielo. Una lista
          corta de condimentos básicos, como canela, comino y salsa de soya, aparece como extras. En la mayoría de las recetas son opcionales, y el
          filtro &quot;Solo básicos de despensa&quot; oculta las que los necesitan.
        </p>
        <p>Nada necesita horno. Las recetas usan microondas, estufa, licuadora o nada de cocción. Algunas ofrecen tostador o freidora de aire como opción.</p>

        <h2>Recetas a su medida</h2>
        <p>
          Cada receta se puede ajustar de 1 a 6 porciones, y las cantidades se redondean a medidas que se pueden hacer con cuchara o taza. Toque
          &quot;cambiar&quot; junto a un ingrediente para usar otro parecido, como aceite en vez de mantequilla. Las etiquetas de dieta, las
          calorías y el costo se actualizan con cada cambio.
        </p>
        <p>
          Marque en <Link href={href("/pantry")}>Mi despensa</Link> lo que tiene en casa, y cada receta le dirá si tiene todo o qué le falta. En el{" "}
          <Link href={href("/plan")}>plan</Link> puede organizar la semana y obtener una sola lista de compras con todo sumado. El modo de cocina
          muestra un paso a la vez, con temporizadores, y mantiene la pantalla encendida.
        </p>

        <h2>Sobre los estimados</h2>
        <p>
          Las etiquetas de dieta salen de la lista de ingredientes. Los productos empacados varían según la marca, así que revise las etiquetas del
          caldo, las salchichas y el cereal si cocina para una alergia o una dieta sin gluten. Las calorías, la proteína, la fibra y los precios son
          aproximados: sirven para planear, no son valores exactos.
        </p>
      </div>
    );
  }
  return (
    <div className={`container ${styles.about}`} lang="en">
      <h1>
        <span className="highlight">About Pantry Pal</span>
      </h1>
      <p>
        Food pantries hand out a fairly predictable set of groceries: canned vegetables and beans, rice, pasta, peanut butter, eggs, milk, a few kinds
        of fresh produce. Knowing what to cook with them is the hard part. Pantry Pal collects {n} recipes that use only those ingredients, so a bag
        from the pantry can turn into breakfast, lunch, dinner, and dessert.
      </p>

      <h2>How the recipes work</h2>
      <p>
        Every recipe sticks to the <Link href={href("/pantry")}>pantry list</Link>. Water and ice are assumed. A short list of basic seasonings, such
        as cinnamon, cumin, and soy sauce, are labeled extras. They are optional in most recipes, and the &quot;Pantry basics only&quot; filter hides
        any recipe that needs one.
      </p>
      <p>Nothing needs an oven. Recipes use a microwave, a stovetop, a blender, or no cooking at all. A few offer a toaster or air fryer as an option.</p>

      <h2>Making a recipe fit</h2>
      <p>
        Each recipe can be scaled from 1 to 6 servings, and amounts round to measurements you can make with a spoon or cup. Tap &quot;swap&quot; next
        to an ingredient to trade it for something similar, such as oil for butter. Diet labels, calories, and cost update with each swap.
      </p>
      <p>
        Mark what you have at home in <Link href={href("/pantry")}>My pantry</Link>, and every recipe tells you whether you have everything or what is
        missing. The <Link href={href("/plan")}>meal plan</Link> lays out a week and builds one shopping list with everything added together. Cook mode
        shows one step at a time with timers and keeps your screen on.
      </p>

      <h2>A note on estimates</h2>
      <p>
        Diet labels come from the ingredient list. Packaged foods vary by brand, so check labels on items like broth, sausage, and cereal if you cook
        for an allergy or a gluten-free diet. Calories, protein, fiber, and prices are rough estimates for planning, not exact values.
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { RECIPES } from "@/lib/catalog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "Why Pantry Pal exists and how its recipes work.",
};

export default function AboutPage() {
  return (
    <div className={`container ${styles.about}`}>
      <h1>
        <span className="highlight">About Pantry Pal</span>
      </h1>
      <p>
        Food pantries hand out a fairly predictable set of groceries: canned vegetables and beans, rice, pasta, peanut butter, eggs, milk, a few
        kinds of fresh produce. Knowing what to cook with them is the hard part. Pantry Pal collects {RECIPES.length} recipes that use only those
        ingredients, so a bag from the pantry can turn into breakfast, lunch, dinner, and dessert.
      </p>

      <h2>How the recipes work</h2>
      <p>
        Every recipe sticks to the <Link href="/pantry">pantry list</Link>. Water and ice are assumed. A short list of basic seasonings, such as
        cinnamon, cumin, and soy sauce, are labeled extras. They are optional in most recipes, and the &quot;Pantry basics only&quot; filter hides
        any recipe that needs one.
      </p>
      <p>
        Nothing needs an oven. Recipes use a microwave, a stovetop, a blender, or no cooking at all. A few offer a toaster or air fryer as an option.
      </p>

      <h2>Making a recipe fit</h2>
      <p>
        Each recipe can be scaled from 1 to 6 servings, and amounts round to measurements you can actually make with a spoon or cup. Tap
        &quot;swap&quot; next to an ingredient to trade it for something similar, such as oil for butter or one canned vegetable for another. The
        diet labels update when you swap.
      </p>
      <p>
        On the recipes page, type what you have and choose &quot;What can I make with only these?&quot;. Pantry Pal lists recipes you can make
        right now first, then ones missing one or two items.
      </p>

      <h2>A note on labels</h2>
      <p>
        Diet labels come from the ingredient list. Packaged foods vary by brand, so check labels on items like broth, sausage, and cereal if you
        cook for an allergy or a gluten-free diet.
      </p>
    </div>
  );
}

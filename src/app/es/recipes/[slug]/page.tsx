import { recipeMetadata, recipeStaticParams, RecipeView } from "@/views/RecipeView";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = recipeStaticParams;

export async function generateMetadata({ params }: Params) {
  return recipeMetadata("es", (await params).slug);
}

export default async function Page({ params }: Params) {
  return <RecipeView lang="es" slug={(await params).slug} />;
}

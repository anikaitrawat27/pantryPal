import { recipeMetadata, recipeStaticParams, RecipeView } from "@/views/RecipeView";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = recipeStaticParams;

export async function generateMetadata({ params }: Params) {
  return recipeMetadata("en", (await params).slug);
}

export default async function Page({ params }: Params) {
  return <RecipeView lang="en" slug={(await params).slug} />;
}

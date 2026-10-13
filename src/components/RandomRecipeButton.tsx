"use client";

import { useRouter } from "next/navigation";
import ui from "./ui.module.css";

export function RandomRecipeButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={ui.button}
      onClick={() => router.push(`/recipes/${slugs[Math.floor(Math.random() * slugs.length)]}`)}
    >
      Surprise me
    </button>
  );
}

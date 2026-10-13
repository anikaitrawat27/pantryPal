import type { Course, Cuisine, Equipment, Meal } from "@/data/schema";

export const COURSE_LABELS: Record<Course, string> = {
  breakfast: "Breakfast",
  main: "Mains",
  soup: "Soups",
  salad: "Salads",
  appetizer: "Appetizers & snacks",
  side: "Sides",
  drink: "Drinks",
  dessert: "Desserts",
};

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const CUISINE_LABELS: Record<Cuisine, string> = {
  american: "American",
  mexican: "Mexican",
  italian: "Italian",
  chinese: "Chinese",
  indian: "Indian",
  thai: "Thai",
  japanese: "Japanese",
  korean: "Korean",
  mediterranean: "Mediterranean",
  "middle-eastern": "Middle Eastern",
  spanish: "Spanish",
  caribbean: "Caribbean",
  french: "French",
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  "no-cook": "No cooking",
  microwave: "Microwave",
  stovetop: "Stovetop",
  blender: "Blender",
  toaster: "Toaster",
  "air-fryer": "Air fryer",
};

export const DIFFICULTY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Easy",
  2: "Medium",
  3: "A little project",
};

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

import { Recipe } from "./Recipe";
export interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}
import { Recipe } from "./Recipe";

export interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
  rating?: number;
} 
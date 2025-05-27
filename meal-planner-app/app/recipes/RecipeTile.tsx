import React, { useEffect, useState} from "react";
import { RecipeTileProps } from "../types/RecipeTyleProps";
import { Recipe } from "../types/Recipe";
import { StarIcon, HeartIcon } from "lucide-react";

const RecipeTile: React.FC<RecipeTileProps> = ({ recipe, onSelect }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    if (storedFavorites) setFavoriteRecipes(JSON.parse(storedFavorites));
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) setRatings(JSON.parse(storedRatings));
  }, []);

  const isFavorite = favoriteRecipes.some((fav) => fav.id === recipe.id);
  const rating = ratings[recipe.id] || 0;

  return (
    <div
      className="relative flex flex-col bg-gray-700 shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-300 cursor-pointer h-full"
      onClick={() => onSelect(recipe)}
    >
      {rating > 0 && (
        <div className="absolute top-0 left-0 flex items-center bg-gray-800 px-2 py-1 rounded-br">
          <span className="text-yellow-500 text-sm">{rating}</span>
          <StarIcon className="w-5 h-5 text-yellow-500 fill-current ml-1" />
        </div>
      )}
      <div className="flex-grow overflow-hidden">
        <img
          src={recipe.image || "/placeholder.jpg"}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-shrink-0 p-2 flex justify-between items-center text-white min-h-1/5">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold truncate">{recipe.name}</h3>
        <button className={isFavorite ? "text-red-500" : "text-gray-500 hover:text-red-500"}>
          <HeartIcon className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
};
export default RecipeTile;
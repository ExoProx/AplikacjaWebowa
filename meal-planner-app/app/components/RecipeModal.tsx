import React , { useState }  from "react";
import { Recipe } from "../types/Recipe";
import StarRating from "./StarRating";

interface RecipeModalProps {
  isOpen: boolean
  recipe: Recipe;
  onClose: () => void;
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, rating, onRatingChange }) => {
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToFavorites = (recipe: Recipe) => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const currentFavorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    if (!currentFavorites.some((fav) => fav.id === recipe.id)) {
      const updatedFavorites = [...currentFavorites, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
      setMessage("Dodano przepis do ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="bg-gray-800 p-4 rounded-lg max-w-250 w-full shadow-xl text-white overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
        <p className="mb-2 text-sm">{recipe.description}</p>
        <h3 className="text-lg font-semibold mb-1">Składniki:</h3>
        <div className="grid grid-cols-2 gap-x-4 mb-2 text-sm">
          {recipe.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex">
              <span className="mr-2">•</span>
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-1">Instrukcje:</h3>
        <p className="mb-2 text-sm">{recipe.instructions}</p>
        <div className="flex justify-between items-center mb-1">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-1">Oceń przepis</h3>
            <StarRating rating={rating} onRatingChange={onRatingChange} />
          </div>
          {message && <p className="text-green-400 mb-1 text-sm">{message}</p>}
          <button
            onClick={() => handleAddToFavorites(recipe)}
            className="bg-red-500 text-white px-20 py-1 rounded text-sm hover:bg-red-600"
          >
            Dodaj do ulubionych
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;

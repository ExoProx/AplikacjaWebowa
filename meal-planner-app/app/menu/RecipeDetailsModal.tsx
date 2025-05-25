import React, { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import StarRating from "./StarRating";
import { Recipe } from "../types/Recipe";



const RecipeDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}> = ({ isOpen, onClose, recipe }) => {
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  }, []);

  const handleRatingChange = (newRating: number) => {
    const updatedRatings = { ...ratings, [recipe.id]: newRating };
    setRatings(updatedRatings);
    localStorage.setItem("recipeRatings", JSON.stringify(updatedRatings));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-4 rounded-lg max-w-2xl w-full shadow-xl text-white overflow-y-auto max-h-[90vh] relative">
        {ratings[recipe.id] > 0 && (
          <div className="absolute top-2 right-2 flex items-center bg-gray-800 px-2 py-1 rounded">
            <span className="text-yellow-500 text-sm">{ratings[recipe.id]}</span>
            <StarIcon className="w-4 h-4 text-yellow-500 fill-current ml-1" />
          </div>
        )}
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
        <div className="flex justify-between items-center">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-1">Oceń przepis</h3>
            <StarRating
              rating={ratings[recipe.id] || 0}
              onRatingChange={handleRatingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailsModal;
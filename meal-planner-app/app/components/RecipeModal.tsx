import React, { useState, useEffect } from "react";
import { Recipe } from "../types/Recipe";
import StarRating from "./StarRating";
import { checkIsFavorite, addToFavorites, removeFromFavorites } from "../api/favorites";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  isOpen: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, rating, onRatingChange, isOpen }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const status = await checkIsFavorite(recipe.id.toString());
      setIsFavorite(status);
    };
    checkFavoriteStatus();
  }, [recipe.id]);

  if (!isOpen) return null;

  const handleFavoriteToggle = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      if (isFavorite) {
        await removeFromFavorites(recipe.id.toString());
        setIsFavorite(false);
      } else {
        await addToFavorites(recipe.id.toString());
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full shadow-xl text-white overflow-hidden relative border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleFavoriteToggle}
                disabled={isLoading}
                className={`transition-colors duration-200 ${isLoading ? 'opacity-50' : isFavorite ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-pink-400'}`}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <HeartIconSolid className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {rating > 0 && (
            <div className="flex items-center mt-2">
              <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-yellow-500 ml-1">{rating}/5</span>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {recipe.image && (
            <div className="mb-6 relative pt-[56.25%]">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="absolute inset-0 w-full h-full object-contain bg-gray-900 rounded-lg"
              />
            </div>
          )}
          
          <div className="space-y-6">
            {recipe.description && (
              <div>
                <p className="text-gray-300">{recipe.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Instructions</h3>
              <div className="text-gray-300 space-y-3">
                {recipe.instructions?.split('\n').map((instruction, index) => (
                  instruction.trim() && (
                    <p key={index} className="text-gray-300">
                      {instruction}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-400 mb-1">Rate this recipe</span>
              <StarRating
                rating={rating}
                onRatingChange={onRatingChange}
              />
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;

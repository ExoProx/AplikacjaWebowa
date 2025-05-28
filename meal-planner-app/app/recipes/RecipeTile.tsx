import React, { useState } from "react";
import { RecipeTileProps } from "../types/RecipeTileProps";
import { StarIcon } from "lucide-react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { addToFavorites, removeFromFavorites } from "../api/favorites";
import axios from "axios";

const RecipeTile: React.FC<RecipeTileProps> = ({ recipe, onSelect, isFavorite = false, onFavoriteChange, rating = 0 }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    setIsFav(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFav) {
        await removeFromFavorites(recipe.id.toString());
        setIsFav(false);
      } else {
        await addToFavorites(recipe.id.toString());
        setIsFav(true);
      }

      onFavoriteChange?.();
    } catch (error) {
      console.error('Error toggling favorite for recipe', recipe.id, ':', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col bg-gray-800 shadow-lg rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-102 hover:shadow-2xl cursor-pointer border border-gray-700"
      onClick={() => onSelect(recipe)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {rating > 0 && (
        <div className="absolute top-2 left-2 flex items-center bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full z-10">
          <span className="text-yellow-400 font-semibold">{rating}</span>
          <StarIcon className="w-4 h-4 text-yellow-400 fill-current ml-1" />
        </div>
      )}
      <div className="relative w-full h-48 overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-70' : 'opacity-0'}`} />
        <img
          src={recipe.image || "/placeholder.jpg"}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4 flex flex-col gap-2 bg-gray-800">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 min-h-[3.5rem]">
            {recipe.name}
          </h3>
          <button 
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' :
              isFav ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-pink-400'
            }`}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            {isFav ? (
              <HeartIconSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {recipe.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default RecipeTile;
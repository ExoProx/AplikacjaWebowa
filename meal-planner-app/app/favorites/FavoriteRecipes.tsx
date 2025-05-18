"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

// Komponent StarRating do oceniania
interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (!readOnly) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) onRatingChange(index);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-16 h-6 ${readOnly ? "" : "cursor-pointer"} ${
            star <= (hoverRating || rating) ? "text-yellow-500 fill-current" : "text-gray-400"
          }`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

// Komponent Sidebar
const Sidebar: React.FC = () => {
   return (
    <div className="w-64 bg-gray-800 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Filtry</h2>
      <input
        type="text"
        placeholder="Szukaj przepisów"
        className="w-full p-2 mb-3 border rounded bg-gray-700 text-white"
      />
      <button
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 mb-4"
      >
        Wyszukaj
      </button>
      <h3 className="text-md font-semibold mb-2 text-white">Sortuj wg</h3>
      <select className="w-full p-2 mb-4 border rounded bg-gray-700 text-white">
        <option>Nazwa</option>
        <option>Popularność</option>
        <option>Ocena</option>
      </select>
      <h3 className="text-md font-semibold mb-2 text-white">Kategorie</h3>
      <div className="space-y-2">
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Śniadanie
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> II Śniadanie
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Obiad
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Podwieczorek
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Kolacja
        </label>
      </div>
    </div>
  );
};

// Komponent RecipeTile
interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

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
          < StarIcon className="w-5 h-5 text-yellow-500 fill-current ml-1" />
        </div>
      )}
      <div className="flex-grow overflow-hidden">
        <img
          src={recipe.image || "/placeholder.jpg"}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-shrink-0 p-2 flex justify-between items-center text-white min-h-[48px]">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold truncate">{recipe.name}</h3>
        <button className={isFavorite ? "text-red-500" : "text-gray-500 hover:text-red-500"}>
          <HeartIcon className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
};

// Komponent RecipeModal
interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onRemove: (recipe: Recipe) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, onRemove, rating, onRatingChange }) => {
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
        <div className="flex justify-between items-center mb-2">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-1">Oceń przepis</h3>
            <StarRating rating={rating} onRatingChange={onRatingChange} />
          </div>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => onRemove(recipe)}
          >
            Usuń z ulubionych
          </button>
        </div>
      </div>
    </div>
  );
};

// Główny komponent FavoriteRecipes
const FavoriteRecipes: React.FC = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    if (storedFavorites) {
      setFavoriteRecipes(JSON.parse(storedFavorites));
    }
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const membru = (recipeId: number, rating: number) => {
    const updatedRatings = { ...ratings, [recipeId]: rating };
    setRatings(updatedRatings);
    localStorage.setItem("recipeRatings", JSON.stringify(updatedRatings));
  };

  const handleRemoveFromFavorites = (recipeToRemove: Recipe) => {
    const updatedFavorites = favoriteRecipes.filter((recipe) => recipe.id !== recipeToRemove.id);
    setFavoriteRecipes(updatedFavorites);
    localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
    setSelectedRecipe(null); // Zamknij modal po usunięciu
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-2 overflow-hidden">
          {favoriteRecipes.length === 0 ? (
            <p className="text-center text-gray-400">Brak ulubionych przepisów</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-full">
              {favoriteRecipes.map((recipe) => (
                <RecipeTile
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleSelectRecipe}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onRemove={handleRemoveFromFavorites}
          rating={ratings[selectedRecipe.id] || 0}
          onRatingChange={(rating) => membru(selectedRecipe.id, rating)}
        />
      )}
      <Footer className="w-full bg-gray-800 p-4 text-white" />
    </div>
  );
};

export default FavoriteRecipes;
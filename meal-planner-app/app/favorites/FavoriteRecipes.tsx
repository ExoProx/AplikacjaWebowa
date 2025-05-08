"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
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

// Komponent Sidebar
const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 mt-10 text-white">Filtry</h2>
      <input
        type="text"
        placeholder="Szukaj przepisów"
        className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
      />
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
          <input type="checkbox" className="mr-2" /> Obiad
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

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    if (storedFavorites) {
      setFavoriteRecipes(JSON.parse(storedFavorites));
    }
  }, []);

  const isFavorite = favoriteRecipes.some((fav) => fav.id === recipe.id);

  return (
    <div
      className="flex flex-col bg-gray-700 shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-300 cursor-pointer h-full"
      onClick={() => onSelect(recipe)}
    >
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
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, onRemove }) => {
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
        <div className="flex justify-between mb-2">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
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

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    if (storedFavorites) {
      setFavoriteRecipes(JSON.parse(storedFavorites));
    }
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
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
        />
      )}
      <Footer className="w-full bg-gray-800 p-4 text-white" />
    </div>
  );
};

export default FavoriteRecipes;
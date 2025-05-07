"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
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
    <div className="w-64 h-auto bg-gray-800 shadow-md p-4">
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
  return (
    <div
      className="bg-gray-700 shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-300 cursor-pointer"
      onClick={() => onSelect(recipe)}
    >
      <img
        src={recipe.image || "/placeholder.jpg"}
        alt={recipe.name}
        className="w-full h-24.5 object-cover"
      />
      <div className="p-4 flex justify-between items-center text-white">
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        <button className="text-red-500">
          <HeartIcon className="w-6 h-6 fill-current" />
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
      <div className="bg-gray-800 p-6 rounded-lg max-w-250 w-full shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
        <p className="mb-4">{recipe.description}</p>
        <h3 className="text-xl font-semibold mb-2">Składniki:</h3>
        <ul className="list-disc list-inside mb-4">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Instrukcje:</h3>
        <p className="mb-4">{recipe.instructions}</p>
        <div className="flex justify-between mb-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() => onRemove(recipe)}
          >
            Usuń z ulubionych
          </button>
          <button className="text-blue-500 hover:underline" onClick={onClose}>
            Zamknij
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
    <div className="min-h-screen flex flex-col bg-gray-900 font-sans text-white">
      <div className="bg-gray-800 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <Link href="/mainPage" className="text-white hover:text-gray-300">
            <HomeIcon className="h-6 w-6" />
          </Link>
          <Link href="/recipes" className="text-white hover:text-gray-300">
            Przepisy
          </Link>
          <Link href="/favorites" className="text-white hover:text-gray-300">
            Ulubione przepisy
          </Link>
          <Link href="/menu" className="text-white hover:text-gray-300">
            Jadłospisy
          </Link>
          <button className="text-white hover:text-gray-300">Wyloguj się</button>
        </div>
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 overflow-auto">
          {favoriteRecipes.length === 0 ? (
            <p className="text-center text-gray-400">Brak ulubionych przepisów</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
      <Footer />
    </div>
  );
};

export default FavoriteRecipes;
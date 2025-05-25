import React, { useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { Recipe } from "../types/Recipe";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  initialRecipes: Recipe[];
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, onSelect, initialRecipes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes || []);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  if (!isOpen) return null;

  const totalPages = Math.ceil((recipes?.length || 0) / recipesPerPage);

  const currentRecipes = recipes
  ? recipes.slice(
      (currentPage - 1) * recipesPerPage,
      currentPage * recipesPerPage
    )
  : [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setRecipes(initialRecipes); // Reset to initial if query empty
      setCurrentPage(1);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/foodSecret/search", {
        params: { query: searchQuery },
        withCredentials: true,
      });
      setRecipes(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="bg-gray-900 p-6 rounded-lg max-w-7xl w-full text-white max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Wybierz przepis</h2>

        {/* Search bar and button */}
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Wyszukaj przepis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            className="flex-grow p-2 rounded-l bg-gray-800 border border-gray-700 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r"
          >
            Szukaj
          </button>
        </div>

        {/* Recipe grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentRecipes.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">
              Nie znaleziono przepisów.
            </p>
          ) : (
            currentRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 hover:scale-105 duration-300 flex flex-col items-center"
                onClick={() => onSelect(recipe)}
              >
                <img
                  src={recipe.image || "/placeholder.jpg"}
                  alt={recipe.name}
                  className="w-16 h-16 object-cover mb-2"
                />
                <p className="text-center">{recipe.name}</p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {recipes.length > recipesPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        <button
          onClick={onClose}
          className="mt-4 text-blue-500 hover:underline"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
};

export default RecipeModal;

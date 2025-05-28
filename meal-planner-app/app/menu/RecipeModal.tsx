import React, { useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";
import { Recipe } from "../types/Recipe";
import Loading from '../components/Loading'; 

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  initialRecipes: Recipe[];
  onSearch: (query: string) => Promise<void>;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, onSelect, initialRecipes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingModalSearch, setIsLoadingModalSearch] = useState(false); 
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
      setRecipes(initialRecipes); 
      setCurrentPage(1);
      return;
    }

    setIsLoadingModalSearch(true); 
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/foodSecret/search`, { // Use API_BASE_URL
        params: { query: searchQuery },
        withCredentials: true,
      });
      setRecipes(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoadingModalSearch(false); 
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
      <div className="bg-gray-900 p-6 rounded-lg max-w-7xl w-full text-white max-h-[80vh] overflow-y-auto relative"> {/* Added relative for loader positioning */}
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
            disabled={isLoadingModalSearch} 
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 px-4 rounded-r"
            disabled={isLoadingModalSearch} 
          >
            Szukaj
          </button>
        </div>

        {/* Loading overlay for the recipe grid */}
        {isLoadingModalSearch ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg z-10">
            <Loading />
          </div>
        ) : (
          <>
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
          </>
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
"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useSearch } from "../../src/SearchContext"
import Pagination from "../components/Pagination";
import RecipeModal from "../components/RecipeModal";
import Loading from '../components/Loading';
import { Recipe } from "../types/Recipe";
import RecipeTile from "./RecipeTile";
import { getFavoriteRecipes } from "../api/favorites";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const RecipesList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);

  const recipesPerPage = 12;
  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const currentRecipes = recipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const { query } = useSearch();

  const refreshFavorites = async () => {
    try {
      const favorites = await getFavoriteRecipes();
      const favoritesArray = Array.from(favorites).map(id => id.toString());
      setFavoriteRecipeIds(favoritesArray);
    } catch (error) {
      // Błędy obsłużone w getFavoriteRecipes
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  useEffect(() => {
    if (!query) {
      setRecipes([]);
      setErrorMessage(null);
      return;
    }

    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      setErrorMessage(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/foodSecret/search?query=${query}`, {
          withCredentials: true,
        });
        setRecipes(response.data.recipes || response.data);
        setCurrentPage(1);
        await refreshFavorites();
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setErrorMessage("Session expired or unauthorized. Please log in again.");
          } else if (err.response.status === 404) {
            setErrorMessage("No recipes found for your search.");
          } else {
            setErrorMessage(`Error searching recipes: ${err.response.statusText || 'Unknown error'}`);
          }
        } else {
          setErrorMessage("An unexpected error occurred while searching for recipes.");
        }
        setRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchRecipes();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  }, []);

  const handleRatingChange = (recipeId: number, rating: number) => {
    const updatedRatings = { ...ratings, [recipeId]: rating };
    setRatings(updatedRatings);
    localStorage.setItem("recipeRatings", JSON.stringify(updatedRatings));
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          {isLoadingRecipes ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {currentRecipes.length === 0 && query ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="text-6xl">🔍</div>
                  <p className="text-xl">No recipes found for "{query.replace('query=', '')}"</p>
                  <p className="text-gray-500">Try a different search term!</p>
                </div>
              ) : currentRecipes.length === 0 && !query ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="text-6xl">👨‍🍳</div>
                  <p className="text-xl">Ready to find some delicious recipes?</p>
                  <p className="text-gray-500">Start by searching using the search bar above!</p>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min flex-1 overflow-y-auto pb-6 px-2">
                    {currentRecipes.map((recipe) => {
                      const recipeIdStr = recipe.id.toString();
                      const isRecipeFavorite = favoriteRecipeIds.includes(recipeIdStr);
                      const recipeRating = ratings[recipe.id] || 0;
                      return (
                        <RecipeTile
                          key={recipe.id}
                          recipe={recipe}
                          onSelect={handleSelectRecipe}
                          isFavorite={isRecipeFavorite}
                          onFavoriteChange={refreshFavorites}
                          rating={recipeRating}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedRecipe && (
        <RecipeModal
          isOpen={!!selectedRecipe}
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          rating={ratings[selectedRecipe.id] || 0}
          onRatingChange={(rating) => handleRatingChange(selectedRecipe.id, rating)}
        />
      )}
      <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
    </div>
  );
};

export default RecipesList;
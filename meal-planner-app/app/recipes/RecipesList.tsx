"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useSearch } from "../../src/SearchContext";
import Pagination from "../components/Pagination";
import RecipeModal from "../components/RecipeModal";
import Loading from '../components/Loading';
import { Recipe } from "../types/Recipe";
import RecipeTile from "./RecipeTile"; // Corrected import based on your latest RecipeTile.tsx

import { useRouter } from 'next/navigation'; // Added for potential redirect on 401

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const RecipesList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const recipesPerPage = 12;
  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const currentRecipes = recipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const { query } = useSearch();
  const router = useRouter(); // Initialize useRouter hook

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
      } catch (err: any) {
        console.error("Fetch recipes failed:", err);
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401) {
                setErrorMessage("Session expired or unauthorized. Please log in again.");
                router.push('/login'); // Redirect to login page on 401
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
  }, [query, router]); // Add router to dependency array

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
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* This div is the main content area for recipes, messages, and loading */}
        <div className="flex-1 flex flex-col p-2">
          {errorMessage && (
            <div className="bg-red-700 text-white p-3 rounded-md mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {/* This inner div handles the conditional rendering and centering */}
          {isLoadingRecipes ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {currentRecipes.length === 0 && query ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                  No recipes found for "{query}". Try a different search!
                </div>
              ) : currentRecipes.length === 0 && !query ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                  Start by searching for recipes using the search bar!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto pb-4 w-full">
                  {currentRecipes.map((recipe) => (
                    <RecipeTile
                      key={recipe.id}
                      recipe={recipe}
                      onSelect={handleSelectRecipe}
                    />
                  ))}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
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
      <Footer className="w-full bg-gray-800 p-4 text-white" />
    </div>
  );
};

export default RecipesList;
"use client";

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { useSearch } from "../../src/SearchContext";
import Pagination from "../components/Pagination";
import RecipeModal from "../components/RecipeModal";
import Loading from '../components/Loading'; // Correct import for Loading
import { Recipe } from "../types/Recipe";
import RecipeTile from "./RecipeTile";

import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const RecipesList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // New state for initial page load/auth
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false); // Existing state for recipe search
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const recipesPerPage = 12;
  const { query } = useSearch();
  const router = useRouter();

  // Memoize fetchRecipes to prevent unnecessary re-creations, especially important with debounce
  const fetchRecipes = useCallback(async () => {
    if (!query) {
      setRecipes([]);
      setIsLoadingRecipes(false); // Ensure loading is off if no query
      setErrorMessage(null);
      return;
    }

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
      // Handle 401 specifically for recipe search if it occurs (though initial auth handles most)
      if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
              setErrorMessage("Session expired or unauthorized. Please log in again.");
              router.push('/login');
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
  }, [query, router]); // Dependency on query and router

  // Effect for initial page load and authentication check
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/users/userdata`, {
          withCredentials: true,
        });
        fetchRecipes();
      } catch (error: any) {
        console.error("Authentication failed on RecipesList:", error);
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          router.push('/login?error=auth');
        } else {
          setErrorMessage("Failed to authenticate. Please try again or log in.");
        }
        setRecipes([]);
      } finally {
        setIsLoadingPage(false);
      }
    };

    authenticateUser();

    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  }, [router, fetchRecipes]); // Added fetchRecipes to dependency array


  // Effect for debounced recipe search (only if query changes AND after initial auth)
  useEffect(() => {
    // Only trigger search if not in the initial page loading phase AND query is present
    if (!isLoadingPage && query) {
      const debounceTimeout = setTimeout(() => {
        fetchRecipes();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(debounceTimeout);
    }
  }, [query, isLoadingPage, fetchRecipes]); // Add fetchRecipes to dependency array


  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const currentRecipes = recipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

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

  // If the page is still loading/authenticating, show a full-page loading spinner
  if (isLoadingPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(21, 32, 43, 0.9)" }}>
        <Loading />
      </div>
    );
  }

  // Once authenticated and page is loaded, render the content
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* This div is the main content area for recipes, messages, and loading */}
        <div className="flex-1 flex flex-col p-2 relative"> {/* Needs relative for inner absolute loading */}
          {errorMessage && (
            <div className="bg-red-700 text-white p-3 rounded-md mb-4 text-center">
              {errorMessage}
            </div>
          )}

          {/* This inner div handles the conditional rendering and centering of recipe search loading */}
          {isLoadingRecipes ? (
            // This div provides the contained overlay effect for recipe search
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg z-10">
              <Loading /> {/* Uses your generic Loading component */}
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
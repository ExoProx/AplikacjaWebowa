"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import RecipeModal from "../components/RecipeModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Recipe } from "../types/Recipe"; // Ensure this path is correct
import { getFavoriteRecipes } from "../api/favorites"; // Ensure this path and function are correct

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const quotes = [
  "Cooking is an art anyone can master!",
  "Food is a symbolic expression of love when words are inadequate.",
  "The kitchen is where the magic happens.",
  "A good cook can make something out of nothing.",
  "Cooking is the best way to relax.",
  "The taste of food is the best memory.",
  "The kitchen is the heart of the home.",
  "Cooking is about creating memories.",
  "Food brings people together.",
  "Every meal is an opportunity to celebrate.",
];

const tips = [
  "To preserve more flavor, steam vegetables instead of boiling them!",
  "Use fresh herbs to add depth to your dishes.",
  "Marinate meat overnight for extra juiciness.",
  "Don't be afraid to experiment with spices.",
  "Always taste while you cook.",
  "Use a sharp knife to make cutting easier and safer.",
  "Plan meals ahead to save time.",
  "Store spices in a dark, dry place.",
  "Use a meat thermometer to avoid overcooking.",
  "Always wash your hands before cooking.",
];

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [quote, setQuote] = useState("");
  const [tip, setTip] = useState("");
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [recommendedRecipe, setRecommendedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const router = useRouter();


  const getRandomRecipes = (array: Recipe[], count: number): Recipe[] => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
  const fetchAllInitialData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setActionMessage(null); 

    try {
      const userResponse = await axios.get(`${API_BASE_URL}/api/users/userdata`, {
        withCredentials: true,
      });
      setUserName(userResponse.data.name || "User");


      let foundRecommendedRecipe: Recipe | null = null;
      try {
        const favoriteIds = await getFavoriteRecipes();
        if (favoriteIds && favoriteIds.length > 0) {
          const recipesResponse = await axios.get<Recipe[]>(`${API_BASE_URL}/foodSecret/search/recipes`, {
            params: { ids: favoriteIds.join(',') },
            withCredentials: true
          });

          if (recipesResponse.data && Array.isArray(recipesResponse.data) && recipesResponse.data.length > 0) {
            setFavoriteRecipes(getRandomRecipes(recipesResponse.data, 4));
            foundRecommendedRecipe = recipesResponse.data[Math.floor(Math.random() * recipesResponse.data.length)];
            setRecommendedRecipe(foundRecommendedRecipe);
          } else {
            console.log('No recipes found for favorite IDs, falling back to general random.');
          }
        } else {
          console.log('No favorite IDs found, fetching general random recipe.');
        }
      } catch (favError) {
        console.error('Error fetching favorite recipes (may be normal if none):', favError);
      }
      if (!foundRecommendedRecipe) {
        const randomRecipeResponse = await axios.get<Recipe[]>(`${API_BASE_URL}/foodSecret/search/random`, {
          withCredentials: true,
        });
        if (randomRecipeResponse.data && Array.isArray(randomRecipeResponse.data) && randomRecipeResponse.data.length > 0) {
          setRecommendedRecipe(randomRecipeResponse.data[0]);
        } else {
          console.log('No general random recipes found either.');
          setRecommendedRecipe(null);
        }
      }

      const storedRatings = localStorage.getItem("recipeRatings");
      if (storedRatings) {
        setRatings(JSON.parse(storedRatings));
      }

    } catch (err) {
      console.error('Main initial data fetch ERROR:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          router.push('/login?error=auth');
        } else {
          setErrorMessage(`Error loading data: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message || 'Unknown error'}`);
        }
      } else {
        setErrorMessage(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);


  useEffect(() => {
    fetchAllInitialData();
  }, [fetchAllInitialData]);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []); 
  // Modal handlers
  const openModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };
  const closeModal = () => {
    setSelectedRecipe(null);
    setActionMessage(null);
  };

  const handleAddToFavorites = (recipe: Recipe) => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const currentFavorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    if (!currentFavorites.some((fav) => fav.id === recipe.id)) {
      const updatedFavorites = [...currentFavorites, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
      setFavoriteRecipes(getRandomRecipes(updatedFavorites, 4));
      setActionMessage("Przepis dodano do ulubionych!");
      setTimeout(() => {
        setActionMessage(null);
      }, 2000);
    } else {
      setActionMessage("Ten przepis jest już w ulubionych!");
      setTimeout(() => {
        setActionMessage(null);
      }, 2000);
    }
  };


  const handleRatingChange = (recipeId: number, rating: number) => {
    setRatings(prevRatings => {
      const newRatings = { ...prevRatings, [recipeId]: rating };
      localStorage.setItem("recipeRatings", JSON.stringify(newRatings));
      return newRatings;
    });
    setActionMessage(`Ocena przepisu: ${rating} gwiazdek!`);
    setTimeout(() => setActionMessage(null), 2000);
  };


  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/90 z-[9999]">
        <Loading />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans relative">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/jedzenie.jpg")' }}
        />
        <div className="absolute inset-0 backdrop-filter backdrop-blur-sm bg-gray-900/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-gray-900/40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {errorMessage && (
            <div className="max-w-7xl mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center backdrop-blur-sm">
              {errorMessage}
            </div>
          )}

          {actionMessage && (
            <div className="max-w-7xl mx-auto mb-6 bg-blue-600/20 border border-blue-600/30 text-blue-300 p-4 rounded-lg text-center backdrop-blur-sm">
              {actionMessage}
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 text-center shadow-xl">
              <h1 className="text-2xl font-bold text-white mb-2">Welcome, {userName}!</h1>
              <p className="text-gray-100">{quote}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Favorites Section */}
              <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
                <div className="p-4 border-b border-gray-800/50">
                  <h2 className="text-lg font-semibold flex items-center">
                    <HeartIconSolid className="w-5 h-5 mr-2 text-pink-500" />
                    Quick Favorites
                  </h2>
                </div>
                <div className="p-4">
                  {favoriteRecipes && favoriteRecipes.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {favoriteRecipes.slice(0, 2).map((recipe) => ( 
                          <div
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="group cursor-pointer bg-black/40 rounded-lg overflow-hidden hover:bg-black/60 transition-all duration-200"
                          >
                            <div className="flex items-center p-2">
                              <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                                <img
                                  src={recipe.image || "/placeholder.jpg"}
                                  alt={recipe.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-100 group-hover:text-blue-400 transition-colors duration-200 truncate">
                                  {recipe.name}
                                </p>
                                {ratings[recipe.id] > 0 && (
                                  <div className="flex items-center mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs text-yellow-500 ml-1">{ratings[recipe.id]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/favorites"
                        className="mt-4 inline-block w-full text-center py-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 border border-blue-400/20 rounded-lg hover:bg-blue-400/10"
                      >
                        View all favorites
                      </Link>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-200">
                      <span className="text-4xl mb-2">❤️</span>
                      <p className="text-sm">No favorite recipes yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Create New Menu Section */}
              <Link
                href="/menu"
                className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 flex flex-col items-center justify-center hover:bg-gray-950 transition-colors duration-200 group shadow-xl"
              >
                <div className="p-4 rounded-full bg-blue-500/40 group-hover:bg-blue-500/50 transition-colors duration-200">
                  <PlusIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                  Create New Menu
                </h2>
                <p className="mt-2 text-sm text-gray-100 text-center">
                  Plan your meals for the week
                </p>
              </Link>

              {/* Recommended Recipe Section */}
              <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 shadow-xl">
                <div className="p-4 border-b border-gray-800/50">
                  <h2 className="text-lg font-semibold">Recommended Recipe</h2>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-gray-200 h-full"> {/* Added h-full for consistent height */}
                  {recommendedRecipe ? (
                    <div className="flex-grow items-center flex flex-col overflow-hidden shadow-md rounded-xl transform transition-transform hover:scale-103 duration-300 w-full">
                      <img
                        src={recommendedRecipe.image || "/placeholder.jpg"}
                        alt={recommendedRecipe.name}
                        className="w-[70%] h-[70%] object-cover rounded-xl cursor-pointer mt-4" // Added mt-4 for spacing
                        onClick={() => openModal(recommendedRecipe)}
                      />
                      <p className="text-center p-2 text-base font-medium truncate">
                        {recommendedRecipe.name}
                      </p>
                      <button
                        onClick={() => handleAddToFavorites(recommendedRecipe)}
                        className="mt-2 py-2 px-4 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 text-sm"
                      >
                        Add to Favorites
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-200 flex-1">
                      <span className="text-4xl mb-2">🍽️</span>
                      <p className="text-sm">No recommended recipe found at this time.</p>
                      <p className="text-xs text-gray-400 mt-1">(Try adding some favorites!)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cooking Tip Section */}
            <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-400">Cooking Tip</h3>
                  <p className="mt-1 text-gray-100">{tip}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {selectedRecipe && (
          <RecipeModal
            isOpen={!!selectedRecipe}
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            rating={ratings[selectedRecipe.id] || 0}
            onRatingChange={(rating) => handleRatingChange(selectedRecipe.id, rating)} // `handleRatingChange` is now defined
          />
        )}

        <Footer className="relative z-10 w-full bg-gray-900/90 backdrop-blur-sm border-t border-gray-800/50 p-4 text-white" />
      </div>
    </div>
  );
};

export default MainPage;
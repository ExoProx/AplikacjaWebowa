"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import "react-datepicker/dist/react-datepicker.css";
import { ShareIcon } from "@heroicons/react/24/outline";
import Loading from "components/Loading"; // <--- IMPORT THE LOADING COMPONENT HERE

// Define your API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Lista cytatów
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

// Lista porad kulinarnych
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

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

// Funkcja do losowego tasowania tablicy (Fisher-Yates shuffle)
const getRandomRecipes = (array: Recipe[], count: number): Recipe[] => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState("Guest");
  const [quote, setQuote] = useState("");
  const [tip, setTip] = useState("");
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [recommendedRecipe, setRecommendedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/foodSecret/userdata`, {
          withCredentials: true,
        });
        setUserName(userResponse.data.username || "User");

        const recipeResponse = await axios.get(`${API_BASE_URL}/foodSecret/search/random`, {
          withCredentials: true,
        });
        const recipes: Recipe[] = recipeResponse.data;
        if (recipes.length > 0) {
          setRecommendedRecipe(recipes[0]);
        }
      } catch (error) {
        console.error('Authentication or data fetch failed:', error);
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
          router.push('/login');
        } else {
          setMessage("Failed to load user data or recommended recipe.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setTip(tips[Math.floor(Math.random() * tips.length)]);

    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const favorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    const randomFavorites = getRandomRecipes(favorites, 4);
    setFavoriteRecipes(randomFavorites);

  }, [router]);

  const openModal = (recipe: Recipe) => setSelectedRecipe(recipe);
  const closeModal = () => { setSelectedRecipe(null); setMessage(null); };

  const handleAddToFavorites = (recipe: Recipe) => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const currentFavorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    if (!currentFavorites.some((fav) => fav.id === recipe.id)) {
      const updatedFavorites = [...currentFavorites, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
      setFavoriteRecipes(getRandomRecipes(updatedFavorites, 4));
      setMessage("Dodano przepis do ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage("Przepis jest już w ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (isLoading) {
    // This div creates the full-screen overlay for the Loading component
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(21, 32, 43, 0.9)" }}>
        <Loading message="Loading Page..." /> {/* Use the imported Loading component */}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen text-white font-sans">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url("/jedzenie.jpg")',
          backgroundSize: "cover",
          filter: "brightness(0.54)",
          zIndex: -1,
        }}
      ></div>
      <Navbar className="h-[7%]" />

      <div className="flex flex-col mt-8 h-[85%] max-w-7xl mx-auto w-full px-2 sm:px-4 overflow-hidden">
        {message && (
          <div className="bg-blue-600 text-white p-3 rounded-md mb-4 text-center">
            {message}
          </div>
        )}
        <section className="text-center py-1 sm:py-2 bg-gray-800 shadow-4xl my-1 sm:my-2 rounded-lg w-full h-[15%] transform transition-transform hover:scale-103 duration-300">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Welcome, {userName}!</h1>
          <p className="text-gray-300 mt-1 text-xs sm:text-sm md:text-base">
            Plan your meals and discover new flavors every day.
          </p>
        </section>

        <div className="grid grid-cols-3 gap-6 sm:gap-5 w-full h-[60%]">
          <section className="flex flex-col bg-gray-800 shadow-4xl rounded-xl overflow-hidden transform transition-transform hover:scale-103 duration-300 h-full">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold p-1 sm:p-2 text-center text-white">
              Favorite Recipes
            </h2>
            {favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 p-2 flex-grow">
                {favoriteRecipes.slice(0, 4).map((recipe, index) => (
                  <div key={index} className="relative group flex flex-col h-full">
                    <img
                      src={recipe.image || "/placeholder.jpg"}
                      alt={recipe.name}
                      className="w-full h-20 object-cover rounded cursor-pointer group-hover:scale-103 transition-transform"
                      onClick={() => openModal(recipe)}
                    />
                    <p className="text-center mt-2 text-xs sm:text-sm truncate">{recipe.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 flex-1 flex items-center justify-center text-xs sm:text-sm">
                No favorite recipes
              </p>
            )}
            <Link href="/favorites" className="text-blue-400 text-center p-1 block hover:underline text-xs sm:text-sm">
              View all favorites
            </Link>
          </section>

          <Link
            href="/menu"
            className="flex flex-col bg-gray-800 shadow-4xl rounded-lg overflow-hidden transform transition-transform hover:scale-103 duration-300 cursor-pointer h-full"
          >
            <div className="flex-grow flex flex-col items-center justify-center p-1 sm:p-2">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-500 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h2 className="text-xs mb-5 sm:text-sm md:text-base font-semibold text-center text-white">
                Create new meal plan
              </h2>
              <h2 className="text-xs mb-5 sm:text-md md:text-xl font-bold text-center text-blue-500">
                or
              </h2>
              <ShareIcon
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-500 mb-1"
              />
              <h2 className="text-xs sm:text-sm md:text-base font-semibold text-center text-white">
                Share your meal plan
              </h2>
            </div>
          </Link>

          <section className="flex flex-col bg-gray-800 shadow-4xl rounded-lg overflow-hidden transform transition-transform hover:scale-103 duration-300 h-full">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold p-1 mt-10 sm:p-2 text-center text-white">
              Recommended Recipe
            </h2>
            {recommendedRecipe ? (
              <div className="flex-grow items-center flex flex-col overflow-hidden shadow-md rounded-xl transform transition-transform hover:scale-103 duration-300">
                <img
                  src={recommendedRecipe.image || "/placeholder.jpg"}
                  alt={recommendedRecipe.name}
                  className="w-[70%] h-[70%] object-cover rounded-xl cursor-pointer"
                  onClick={() => openModal(recommendedRecipe)}
                />
                <p className="text-center p-1 text-xs sm:text-sm truncate">
                  {recommendedRecipe.name}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 flex-1 flex items-center justify-center text-xs sm:text-sm">
                Loading recipe...
              </p>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-5 py-1 sm:py-2 w-full h-[17%]">
          <section className="flex flex-col bg-gray-800 shadow-4xl rounded-lg transform transition-transform hover:scale-103 duration-300 p-2 sm:p-3 overflow-hidden">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold mb-1 text-white">
              Quote of the Day
            </h2>
            <p className="text-gray-300 italic text-xs sm:text-sm overflow-hidden text-ellipsis">
              "{quote}"
            </p>
          </section>

          <section className="flex flex-col bg-gray-800 shadow-4xl rounded-lg transform transition-transform hover:scale-103 duration-300 p-2 sm:p-3 overflow-hidden">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold mb-1 text-white">
              Cooking Tip
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm overflow-hidden text-ellipsis">
              {tip}
            </p>
          </section>
        </div>
      </div>

      {selectedRecipe && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={closeModal}
        >
          <div
            className="bg-gray-800 p-4 rounded-xl max-w-lg w-full text-white relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
              {selectedRecipe.name}
            </h3>
            <p className="mb-4 text-xs sm:text-sm md:text-base">{selectedRecipe.description}</p>
            <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2">Ingredients:</h4>
            <div className="grid grid-cols-2 gap-x-4 mb-2 text-xs sm:text-sm">
              {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                <div key={index} className="flex">
                  <span className="mr-2">•</span>
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
            <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2">Instructions:</h4>
            <p className="mb-4 text-xs sm:text-sm md:text-base">{selectedRecipe.instructions}</p>
            {selectedRecipe.id === recommendedRecipe?.id && (
              <div className="mb-4">
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => handleAddToFavorites(selectedRecipe)}
                    className="bg-red-500 text-center text-white px-2 py-1 rounded text-xs sm:text-sm hover:bg-red-600"
                  >
                    Add to Favorites
                  </button>
                </div>
                {message && <p className="text-green-400 mt-2 text-xs sm:text-sm">{message}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer className="h-[8%] w-full bg-gray-800 p-4 text-white" />
    </div>
  );
};

export default MainPage;
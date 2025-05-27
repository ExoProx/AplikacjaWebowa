"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { Recipe } from "../types/Recipe";
import { getFavoriteRecipes, removeFromFavorites } from "../api/favorites";
import axios from "axios";
import Loading from '../components/Loading';
import RecipeModal from "../components/RecipeModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const FavoriteRecipes: React.FC = () => {
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const recipeIds = await getFavoriteRecipes();
        setFavoriteRecipeIds(recipeIds);
        
        if (recipeIds.length > 0) {
          const response = await axios.get(`${API_BASE_URL}/foodSecret/search/recipes`, {
            params: { ids: recipeIds.join(',') },
            withCredentials: true
          });
          
          setFavoriteRecipes(response.data);
          
          const storedRatings = localStorage.getItem("recipeRatings");
          if (storedRatings) {
            setRatings(JSON.parse(storedRatings));
          }
        } else {
          setFavoriteRecipes([]);
        }
        setError(null);
      } catch (_err) {
        setError("Nie udało się załadować ulubionych przepisów");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFromFavorites = async (recipeId: string) => {
    try {
      await removeFromFavorites(recipeId);
      setFavoriteRecipeIds(prev => prev.filter(id => id !== recipeId));
      setFavoriteRecipes(prev => prev.filter(recipe => recipe.id.toString() !== recipeId));
      setSelectedRecipe(null);
    } catch (_err) {
      setError("Nie udało się usunąć przepisu z ulubionych");
    }
  };

  const handleRatingChange = (recipeId: number, rating: number) => {
    const updatedRatings = { ...ratings, [recipeId]: rating };
    setRatings(updatedRatings);
    localStorage.setItem("recipeRatings", JSON.stringify(updatedRatings));
  };

  const RecipeTile: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const recipeRating = ratings[recipe.id] || 0;
    
    return (
      <div
        className="group relative flex flex-col bg-gray-800 shadow-lg rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200 h-[300px]"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <div className="aspect-w-16 aspect-h-9 relative w-full">
          <Image
            src={recipe.image || "/placeholder.jpg"}
            alt={recipe.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
            {recipe.name}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromFavorites(recipe.id.toString());
              }}
              className="text-pink-500 hover:text-pink-400 transition-colors duration-200"
            >
              <HeartIconSolid className="w-6 h-6" />
            </button>
            {recipeRating > 0 && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-yellow-500 ml-1">{recipeRating}/5</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
              {error}
            </div>
          ) : favoriteRecipes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="text-6xl">❤️</div>
              <p className="text-xl">No favorite recipes yet</p>
              <p className="text-gray-500">Start adding recipes to your favorites!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min flex-1 overflow-y-auto pb-6 px-2">
                {favoriteRecipes.map((recipe) => (
                  <RecipeTile key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
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

export default FavoriteRecipes;
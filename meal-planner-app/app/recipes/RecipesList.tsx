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
import { Recipe } from "../types/Recipe";
import { StarRatingProps } from "../types/StarRatingProps";

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (!readOnly) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (!readOnly && onRatingChange) onRatingChange(index);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-16 h-6 ${readOnly ? "" : "cursor-pointer"} ${
            star <= (hoverRating || rating) ? "text-yellow-500 fill-current" : "text-gray-400"
          }`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeTile: React.FC<RecipeTileProps> = ({ recipe, onSelect }) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    if (storedFavorites) setFavoriteRecipes(JSON.parse(storedFavorites));
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) setRatings(JSON.parse(storedRatings));
  }, []);

  const isFavorite = favoriteRecipes.some((fav) => fav.id === recipe.id);
  const rating = ratings[recipe.id] || 0;

  return (
    <div
      className="relative flex flex-col bg-gray-700 shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-300 cursor-pointer h-full"
      onClick={() => onSelect(recipe)}
    >
      {rating > 0 && (
        <div className="absolute top-0 left-0 flex items-center bg-gray-800 px-2 py-1 rounded-br">
          <span className="text-yellow-500 text-sm">{rating}</span>
          <StarIcon className="w-5 h-5 text-yellow-500 fill-current ml-1" />
        </div>
      )}
      <div className="flex-grow overflow-hidden">
        <img
          src={recipe.image || "/placeholder.jpg"}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-shrink-0 p-2 flex justify-between items-center text-white min-h-1/5">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold truncate">{recipe.name}</h3>
        <button className={isFavorite ? "text-red-500" : "text-gray-500 hover:text-red-500"}>
          <HeartIcon className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
};


const RecipesList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  const recipesPerPage = 12;
  const totalPages = Math.ceil(recipes.length / recipesPerPage);
  const currentRecipes = recipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const { query } = useSearch();

  useEffect(() => {
    if (!query) return;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/foodSecret/search?query=${query}`, {
          withCredentials: true,
        });
        setRecipes(response.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query]);

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
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-2 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-full">
              {currentRecipes.map((recipe) => (
                <RecipeTile
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleSelectRecipe}
                />
              ))}
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {selectedRecipe && (
        <RecipeModal
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
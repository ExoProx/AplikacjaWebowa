"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients?: string[];
  instructions?: string;
  image?: string;
}

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

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

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  rating: number;
  onRatingChange: (rating: number) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, rating, onRatingChange }) => {
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToFavorites = (recipe: Recipe) => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const currentFavorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    if (!currentFavorites.some((fav) => fav.id === recipe.id)) {
      const updatedFavorites = [...currentFavorites, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
      setMessage("Dodano przepis do ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="bg-gray-800 p-4 rounded-lg max-w-250 w-full shadow-xl text-white overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
        <p className="mb-2 text-sm">{recipe.description}</p>
        <h3 className="text-lg font-semibold mb-1">Składniki:</h3>
        <div className="grid grid-cols-2 gap-x-4 mb-2 text-sm">
          {recipe.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex">
              <span className="mr-2">•</span>
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-1">Instrukcje:</h3>
        <p className="mb-2 text-sm">{recipe.instructions}</p>
        <div className="flex justify-between items-center mb-1">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-1">Oceń przepis</h3>
            <StarRating rating={rating} onRatingChange={onRatingChange} />
          </div>
          {message && <p className="text-green-400 mb-1 text-sm">{message}</p>}
          <button
            onClick={() => handleAddToFavorites(recipe)}
            className="bg-red-500 text-white px-20 py-1 rounded text-sm hover:bg-red-600"
          >
            Dodaj do ulubionych
          </button>
        </div>
      </div>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center py-2">
      <button
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {"<"}
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded mx-1 ${
            currentPage === page
              ? "bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {">"}
      </button>
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

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/foodSecret/search?query=a');
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) setRatings(JSON.parse(storedRatings));

    fetchRecipes();
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
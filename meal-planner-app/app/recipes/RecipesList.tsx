"use client";

import React, { useState } from "react";
import { HeartIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

// Mockowe dane przepisów
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Spaghetti Bolognese",
    description: "Klasyczne włoskie danie z makaronem i sosem mięsnym.",
    ingredients: ["makaron spaghetti", "mięso mielone", "pomidory", "cebula", "czosnek"],
    instructions: "1. Ugotuj makaron. 2. Podsmaż mięso z cebulą i czosnkiem. 3. Dodaj pomidory i gotuj sos. 4. Połącz makaron z sosem.",
    image: "/spaghetti.jpg",
  },
  {
    id: 2,
    name: "Sałatka Cezar",
    description: "Świeża sałatka z kurczakiem, grzankami i sosem Cezar.",
    ingredients: ["sałata rzymska", "kurczak", "grzanki", "parmezan", "sos Cezar"],
    instructions: "1. Ugrilluj kurczaka. 2. Pokrój sałatę. 3. Dodaj grzanki i parmezan. 4. Polej sosem.",
    image: "/cezar.webp",
  },
  {
    id: 3,
    name: "Pancakes",
    description: "Puszyste naleśniki na śniadanie.",
    ingredients: ["mąka", "mleko", "jajka", "cukier", "proszek do pieczenia"],
    instructions: "1. Wymieszaj składniki. 2. Smaż na patelni. 3. Podawaj z syropem klonowym.",
    image: "/images/pancakes.jpg",
  },
  {
    id: 4,
    name: "Zupa Pomidorowa",
    description: "Klasyczna zupa pomidorowa z makaronem.",
    ingredients: ["pomidory", "makaron", "cebula", "czosnek", "bulion"],
    instructions: "1. Podsmaż cebulę i czosnek. 2. Dodaj pomidory i bulion. 3. Gotuj, dodaj makaron.",
    image: "/images/tomato-soup.jpg",
  },
  {
    id: 5,
    name: "Kurczak Curry",
    description: "Aromatyczne danie z kurczakiem i curry.",
    ingredients: ["kurczak", "mleko kokosowe", "curry", "ryż", "cebula"],
    instructions: "1. Podsmaż kurczaka z cebulą. 2. Dodaj curry i mleko kokosowe. 3. Podawaj z ryżem.",
    image: "/images/chicken-curry.jpg",
  },
  {
    id: 6,
    name: "Tiramisu",
    description: "Włoski deser z mascarpone i kawą.",
    ingredients: ["mascarpone", "kawa", "biszkopty", "kakao", "cukier"],
    instructions: "1. Ubij mascarpone z cukrem. 2. Namocz biszkopty w kawie. 3. Ułóż warstwy i posyp kakao.",
    image: "/images/tiramisu.jpg",
  },
  {
    id: 7,
    name: "Pizza Margherita",
    description: "Klasyczna pizza z pomidorami i mozzarellą.",
    ingredients: ["ciasto na pizzę", "pomidory", "mozzarella", "bazylia", "oliwa"],
    instructions: "1. Rozwałkuj ciasto. 2. Dodaj pomidory, mozzarellę i bazylię. 3. Piecz w 220°C.",
    image: "/images/pizza.jpg",
  },
  {
    id: 8,
    name: "Guacamole",
    description: "Meksykańska pasta z awokado.",
    ingredients: ["awokado", "pomidor", "cebula", "limonka", "kolendra"],
    instructions: "1. Rozgnieć awokado. 2. Dodaj pokrojony pomidor, cebulę i sok z limonki. 3. Wymieszaj.",
    image: "/images/guacamole.jpg",
  },
  {
    id: 9,
    name: "Lasagne",
    description: "Włoska zapiekanka z mięsem i beszamelem.",
    ingredients: ["makaron lasagne", "mięso mielone", "pomidory", "beszamel", "parmezan"],
    instructions: "1. Przygotuj sos mięsny. 2. Ułóż warstwy makaronu, sosu i beszamelu. 3. Piecz.",
    image: "/images/lasagne.jpg",
  },
  {
    id: 10,
    name: "Sushi",
    description: "Japońskie rolki z ryżem i łososiem.",
    ingredients: ["ryż do sushi", "łosoś", "nori", "awokado", "soja"],
    instructions: "1. Ugotuj ryż. 2. Zawiń składniki w nori. 3. Pokrój na kawałki.",
    image: "/images/sushi.jpg",
  },
  {
    id: 11,
    name: "Tacos",
    description: "Meksykańskie tacos z wołowiną.",
    ingredients: ["tortille", "wołowina", "salsa", "sałata", "ser"],
    instructions: "1. Podsmaż wołowinę. 2. Przygotuj salsę. 3. Napełnij tortille.",
    image: "/images/tacos.jpg",
  },
  {
    id: 12,
    name: "Brownie",
    description: "Czekoladowe ciasto brownie.",
    ingredients: ["czekolada", "masło", "cukier", "jajka", "mąka"],
    instructions: "1. Rozpuść czekoladę z masłem. 2. Wymieszaj z resztą składników. 3. Piecz.",
    image: "/images/brownie.jpg",
  },
  {
    id: 13,
    name: "Pad Thai",
    description: "Tajskie danie z makaronem ryżowym.",
    ingredients: ["makaron ryżowy", "krewetki", "orzechy", "limonka", "sos sojowy"],
    instructions: "1. Podsmaż krewetki. 2. Dodaj makaron i sos. 3. Posyp orzechami.",
    image: "/images/pad-thai.jpg",
  },
  {
    id: 14,
    name: "Hummus",
    description: "Pasta z ciecierzycy.",
    ingredients: ["ciecierzyca", "tahini", "cytryna", "czosnek", "oliwa"],
    instructions: "1. Zmiksuj ciecierzycę z tahini. 2. Dodaj cytrynę i czosnek. 3. Polej oliwą.",
    image: "/images/hummus.jpg",
  },
];

// Komponent Sidebar
const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-gray-800 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Filtry</h2>
      <input
        type="text"
        placeholder="Szukaj przepisów"
        className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
      />
      <h3 className="text-md font-semibold mb-2 text-white">Sortuj wg</h3>
      <select className="w-full p-2 mb-4 border rounded bg-gray-700 text-white">
        <option>Nazwa</option>
        <option>Popularność</option>
        <option>Ocena</option>
      </select>
      <h3 className="text-md font-semibold mb-2 text-white">Kategorie</h3>
      <div className="space-y-2">
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Śniadanie
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Obiad
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Kolacja
        </label>
      </div>
    </div>
  );
};

// Komponent RecipeTile
interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

// Komponent RecipeTile
interface RecipeTileProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

const RecipeTile: React.FC<RecipeTileProps> = ({ recipe, onSelect }) => {
  return (
    <div
      className="bg-gray-700 shadow-md rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-300 cursor-pointer"
      onClick={() => onSelect(recipe)}
    >
      <img
        src={recipe.image || "/placeholder.jpg"}
        alt={recipe.name}
        className="w-full h-24.5 object-cover"
      />
      <div className="p-4 flex justify-between items-center text-white">
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        <button className="text-gray-500 hover:text-red-500">
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Komponent RecipeModal
interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(229, 231, 235, 0.8)" }}
    >
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
        <p className="mb-4">{recipe.description}</p>
        <h3 className="text-xl font-semibold mb-2">Składniki:</h3>
        <ul className="list-disc list-inside mb-4">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Instrukcje:</h3>
        <p className="mb-4">{recipe.instructions}</p>
        <div className="flex justify-between mb-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Dodaj do jadłospisu
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Dodaj do ulubionych
          </button>
        </div>
        <button className="text-blue-500 hover:underline" onClick={onClose}>
          Zamknij
        </button>
      </div>
    </div>
  );
};

// Komponent Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-4">
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
            currentPage === page ? "bg-blue-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
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

// Główny komponent RecipesList
const RecipesList: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const recipesPerPage = 12;
  const totalPages = Math.ceil(mockRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = mockRecipes.slice(startIndex, endIndex);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-900 font-sans text-white">
      {/* Uproszczony pasek nawigacji */}
      <div className="bg-gray-800 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <Link href="/" className="text-white hover:text-gray-300">
            <HomeIcon className="h-6 w-6" />
          </Link>
          <button className="text-white hover:text-gray-300">Wyloguj się</button>
        </div>
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {currentRecipes.map((recipe) => (
              <RecipeTile
                key={recipe.id}
                recipe={recipe}
                onSelect={handleSelectRecipe}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
      {/* Szary pasek na dole strony */}
      <div className="bg-gray-800 py-4 text-center">
        <p className="text-white">@MNIAMPLAN</p>
      </div>
    </div>
  );
};

export default RecipesList;
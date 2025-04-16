"use client";

import React, { useState, useEffect } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
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

// Dni tygodnia i typy posiłków
const daysOfWeek = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
] as const;
type DayOfWeek = typeof daysOfWeek[number];

const mealTypes = [
  { key: "breakfast", label: "Śniadanie" },
  { key: "secondBreakfast", label: "II Śniadanie" },
  { key: "lunch", label: "Obiad" },
  { key: "afternoonSnack", label: "Podwieczorek" },
  { key: "dinner", label: "Kolacja" },
] as const;
type MealType = typeof mealTypes[number]["key"];

// Struktura jadłospisu
type MealPlan = {
  [key in MealType]: Recipe | null;
};

type MealPlans = {
  [key in DayOfWeek]: MealPlan;
};

// Inicjalizacja pustych jadłospisów
const initializeMealPlans = (): MealPlans => {
  return daysOfWeek.reduce((acc, day) => {
    acc[day] = mealTypes.reduce((mealAcc, meal) => {
      mealAcc[meal.key] = null;
      return mealAcc;
    }, {} as MealPlan);
    return acc;
  }, {} as MealPlans);
};

// Komponent MealTile
interface MealTileProps {
  meal: { key: MealType; label: string };
  recipe: Recipe | null;
  onSelect: (recipe: Recipe) => void;
}

const MealTile: React.FC<MealTileProps> = ({ meal, recipe, onSelect }) => {
  return (
    <div
      className={`bg-gray-700 shadow-md rounded-lg overflow-hidden ${
        recipe
          ? "transform transition-transform hover:scale-107 duration-300 cursor-pointer"
          : ""
      }`}
      onClick={() => recipe && onSelect(recipe)}
    >
      {recipe && recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-24 object-cover"
        />
      ) : (
        <div className="w-full h-24 bg-gray-600 flex items-center justify-center">
          <span className="text-gray-400">Brak zdjęcia</span>
        </div>
      )}
      <div className="p-4 text-white">
        <h3 className="text-lg font-semibold">{meal.label}</h3>
        <p>{recipe ? recipe.name : "Brak przepisu"}</p>
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
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
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
        <button className="text-blue-500 hover:underline" onClick={onClose}>
          Zamknij
        </button>
      </div>
    </div>
  );
};

// Główny komponent Menu
const Menu: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlans>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mealPlans");
      return stored ? JSON.parse(stored) : initializeMealPlans();
    }
    return initializeMealPlans();
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Aktualizacja stanu przy zmianie w localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mealPlans");
      if (stored) {
        setMealPlans(JSON.parse(stored));
      }
    }
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-900 font-sans text-white">
      <div className="bg-gray-800 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <Link href="/mainPage" className="text-white hover:text-gray-300">
            <HomeIcon className="h-6 w-6" />
          </Link>
          <Link href="/recipes" className="text-white hover:text-gray-300">
            Przepisy
          </Link>
          <Link href="/favorites" className="text-white hover:text-gray-300">
            Ulubione przepisy
          </Link>
          <Link href="/menu" className="text-white hover:text-gray-300">
            Jadłospisy
          </Link>
          <button className="text-white hover:text-gray-300">Wyloguj się</button>
        </div>
      </div>
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Jadłospisy</h1>
        {daysOfWeek.map((day) => {
          const dayPlan = mealPlans[day];
          const hasPlan = Object.values(dayPlan).some((recipe) => recipe !== null);
          return (
            <div key={day} className="mb-8">
              <h2 className="text-2xl font-semibold mb-1">{day}</h2>
              {hasPlan ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {mealTypes.map((meal) => (
                    <MealTile
                      key={meal.key}
                      meal={meal}
                      recipe={dayPlan[meal.key]}
                      onSelect={handleSelectRecipe}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Brak jadłospisu na ten dzień</p>
              )}
            </div>
          );
        })}
      </div>
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
      <div className="bg-gray-800 py-4 text-center">
        <p className="text-white">@MNIAMPLAN</p>
      </div>
    </div>
  );
};

export default Menu;
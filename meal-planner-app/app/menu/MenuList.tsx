"use client";

import React, { useState, useEffect } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Footer from "../components/Footer";

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

// Typy posiłków
const mealTypes = [
  { key: "breakfast", label: "Śniadanie" },
  { key: "secondBreakfast", label: "II Śniadanie" },
  { key: "lunch", label: "Obiad" },
  { key: "afternoonSnack", label: "Podwieczorek" },
  { key: "dinner", label: "Kolacja" },
] as const;
type MealType = typeof mealTypes[number]["key"];

// Struktura jadłospisu dla konkretnej daty
type DailyMealPlan = {
  [key in MealType]: Recipe | null;
};

// Funkcja do uzyskania daty początku tygodnia (poniedziałek)
const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay(); // 0 - niedziela, 1 - poniedziałek, ..., 6 - sobota
  const diff = day === 0 ? 6 : day - 1; // jeśli niedziela, to diff=6, else day-1
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  return start;
};

// Funkcja do generowania dat dla całego tygodnia
const getWeekDates = (startDate: Date): string[] => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

// Nazwy dni tygodnia
const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

// Komponent MealTile
interface MealTileProps {
  recipe: Recipe | null;
  onSelect: (recipe: Recipe, date: string, mealType: MealType) => void;
  date: string;
  mealType: MealType;
}

const MealTile: React.FC<MealTileProps> = ({ recipe, onSelect, date, mealType }) => {
  return (
    <div
      className={`bg-gray-700 shadow-md rounded-lg overflow-hidden w-40 h-full ${
        recipe
          ? "transform transition-transform hover:scale-105 duration-300 cursor-pointer"
          : ""
      }`}
      onClick={() => recipe && onSelect(recipe, date, mealType)}
    >
      {recipe && recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-8 object-cover"
        />
      ) : (
        <div className="w-full h-9 bg-gray-600 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Brak zdjęcia</span>
        </div>
      )}
      <div className="p-2 text-white">
        <p className="text-xs">{recipe ? recipe.name : "Brak przepisu"}</p>
      </div>
    </div>
  );
};

// Komponent RecipeModal
interface RecipeModalProps {
  recipe: Recipe;
  date: string;
  mealType: MealType;
  onClose: () => void;
  onRemove: (date: string, mealType: MealType) => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, date, mealType, onClose, onRemove }) => {
  const handleRemove = () => {
    onRemove(date, mealType);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
    >
      <div className="bg-gray-800 p-6 rounded-lg max-w-250 w-full shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4">{recipe.name}</h2>
        <p className="mb-4">{recipe.description}</p>
        <h3 className="text-xl font-semibold mb-2">Składniki:</h3>
        <ul className="list-disc list-inside mb-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <h3 className="text-xl font-semibold mb-2">Instrukcje:</h3>
        <p className="mb-4">{recipe.instructions}</p>
        <div className="flex justify-between">
          <button className="text-blue-500 hover:underline" onClick={onClose}>
            Zamknij
          </button>
          <button className="text-red-500 hover:underline" onClick={handleRemove}>
            Usuń przepis z jadłospisu
          </button>
        </div>
      </div>
    </div>
  );
};

// Główny komponent Menu
const Menu: React.FC = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    return startOfWeek.toISOString().split("T")[0];
  });
  const [mealPlans, setMealPlans] = useState<{ [date: string]: DailyMealPlan }>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mealPlans");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [selectedRecipe, setSelectedRecipe] = useState<{ recipe: Recipe; date: string; mealType: MealType } | null>(null);

  // Generowanie dat dla wybranego tygodnia
  const weekDates = getWeekDates(new Date(selectedWeekStart));

  // Funkcja do zmiany tygodnia
  const changeWeek = (offset: number) => {
    const currentStart = new Date(selectedWeekStart);
    currentStart.setDate(currentStart.getDate() + offset * 7);
    setSelectedWeekStart(currentStart.toISOString().split("T")[0]);
  };

  // Funkcja obsługująca wybór przepisu
  const handleSelectRecipe = (recipe: Recipe, date: string, mealType: MealType) => {
    setSelectedRecipe({ recipe, date, mealType });
  };

  // Funkcja obsługująca usuwanie przepisu
  const handleRemoveRecipe = (date: string, mealType: MealType) => {
    setMealPlans((prevPlans) => {
      const updatedPlans = { ...prevPlans };
      if (updatedPlans[date]) {
        updatedPlans[date] = { ...updatedPlans[date], [mealType]: null };
      }
      localStorage.setItem("mealPlans", JSON.stringify(updatedPlans));
      return updatedPlans;
    });
  };

  // Renderowanie tabeli
  const renderTable = () => {
    return (
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="w-1/12 p-1 text-right">Posiłek</th>
            {weekDates.map((date, index) => (
              <th key={date} className="p-1 text-center text-sm">
                {daysOfWeek[index]}<br />
                {date}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((meal) => (
            <tr key={meal.key} className="border-t border-gray-700">
              <td className="p-1 text-right text-sm font-semibold">{meal.label}</td>
              {weekDates.map((date) => {
                const dailyPlan = mealPlans[date] || mealTypes.reduce((acc, m) => {
                  acc[m.key] = null;
                  return acc;
                }, {} as DailyMealPlan);
                const recipe = dailyPlan[meal.key];
                return (
                  <td key={date} className="p-1 align-top">
                    <MealTile
                      recipe={recipe}
                      onSelect={handleSelectRecipe}
                      date={date}
                      mealType={meal.key}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
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
      <div className="flex-1 p-2">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => changeWeek(-1)}
            className="bg-gray-700 px-4 py-2 rounded-l hover:bg-gray-600"
          >
            Poprzedni tydzień
          </button>
          <span className="bg-gray-600 px-4 py-2">
            {selectedWeekStart} - {weekDates[6]}
          </span>
          <button
            onClick={() => changeWeek(1)}
            className="bg-gray-700 px-4 py-2 rounded-r hover:bg-gray-600"
          >
            Następny tydzień
          </button>
        </div>
        <div className="max-w-7xl mx-auto">{renderTable()}</div>
      </div>
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe.recipe}
          date={selectedRecipe.date}
          mealType={selectedRecipe.mealType}
          onClose={() => setSelectedRecipe(null)}
          onRemove={handleRemoveRecipe}
        />
      )}
      <div className="bg-gray-800 text-center">
        <Footer />
      </div>
    </div>
  );
};

export default Menu;
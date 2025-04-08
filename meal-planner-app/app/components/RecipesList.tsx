// components/RecipesList.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
}

// Mockowe dane przepisów
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: "Spaghetti Bolognese",
    description: "Klasyczne włoskie danie z makaronem i sosem mięsnym.",
    ingredients: ["makaron spaghetti", "mięso mielone", "pomidory", "cebula", "czosnek"],
    instructions: "1. Ugotuj makaron. 2. Podsmaż mięso z cebulą i czosnkiem. 3. Dodaj pomidory i gotuj sos. 4. Połącz makaron z sosem."
  },
  {
    id: 2,
    name: "Sałatka Cezar",
    description: "Świeża sałatka z kurczakiem, grzankami i sosem Cezar.",
    ingredients: ["sałata rzymska", "kurczak", "grzanki", "parmezan", "sos Cezar"],
    instructions: "1. Ugrilluj kurczaka. 2. Pokrój sałatę. 3. Dodaj grzanki i parmezan. 4. Polej sosem."
  },
];

const RecipesList: React.FC = () => {
  // Stan do przechowywania wybranego przepisu
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Funkcja obsługująca wybór przepisu
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Przepisy kulinarne</h1>

      {/* Lista przepisów lub komunikat o braku */}
      {mockRecipes.length > 0 ? (
        <div>
          <ul className="space-y-4">
            {mockRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectRecipe(recipe)}
              >
                <h2 className="text-xl font-semibold">{recipe.name}</h2>
                <p className="text-gray-600">{recipe.description}</p>
              </li>
            ))}
          </ul>

          {/* Szczegóły wybranego przepisu */}
          {selectedRecipe && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-2">{selectedRecipe.name}</h2>
              <p className="text-gray-700 mb-4">{selectedRecipe.description}</p>
              <h3 className="text-xl font-semibold mb-2">Składniki:</h3>
              <ul className="list-disc list-inside mb-4">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold mb-2">Instrukcje:</h3>
              <p className="text-gray-700">{selectedRecipe.instructions}</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => setSelectedRecipe(null)}
              >
                Wróć do listy
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-red-600 font-semibold">
          Brak dostępnych przepisów.
        </p>
      )}

      {/* Przycisk powrotu do strony głównej */}
      <div className="mt-6">
        <Link href="/mainPage" className="hover:underline">
              <SubmitButton type="submit">Powrót do strony głównej</SubmitButton>
        </Link>
      </div>
    </div>
  );
};

export default RecipesList;
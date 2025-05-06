"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import SubmitButton from "components/SubmitButton";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import pl from "date-fns/locale/pl";

registerLocale("pl", pl);

// Lista cytatów
const quotes = [
  "Gotowanie to sztuka, którą każdy może opanować!",
  "Jedzenie jest symbolicznym wyrazem miłości, gdy słowa są niewystarczające.",
  "Kuchnia to miejsce, gdzie magia się zdarza.",
  "Dobry kucharz to taki, który potrafi zrobić coś z niczego.",
  "Gotowanie to najlepszy sposób na relaks.",
  "Smak jedzenia jest najlepszym wspomnieniem.",
  "Kuchnia to serce domu.",
  "Gotowanie to tworzenie wspomnień.",
  "Jedzenie łączy ludzi.",
  "Każdy posiłek to okazja do świętowania.",
];

// Lista porad kulinarnych
const tips = [
  "Aby warzywa zachowały więcej smaku, gotuj je na parze zamiast w wodzie!",
  "Używaj świeżych ziół, aby dodać głębi smaku potrawom.",
  "Marynuj mięso przez noc, aby było bardziej soczyste.",
  "Nie bój się eksperymentować z przyprawami.",
  "Zawsze próbuj potrawy w trakcie gotowania.",
  "Używaj ostrego noża, aby krojenie było łatwiejsze i bezpieczniejsze.",
  "Planuj posiłki z wyprzedzeniem, aby zaoszczędzić czas.",
  "Przechowuj przyprawy w ciemnym i suchym miejscu.",
  "Używaj termometru do mięsa, aby uniknąć przegotowania.",
  "Zawsze myj ręce przed gotowania.",
];

// Typy posiłków
const mealTypes = [
  { key: "breakfast", label: "Śniadanie" },
  { key: "secondBreakfast", label: "II Śniadanie" },
  { key: "lunch", label: "Obiad" },
  { key: "afternoonSnack", label: "Podwieczorek" },
  { key: "dinner", label: "Kolacja" },
] as const;
type MealType = typeof mealTypes[number]["key"];

// Interfejs dla przepisu
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  image?: string;
}

// Struktura jadłospisu dla konkretnej daty
type DailyMealPlan = {
  [key in MealType]: Recipe | null;
};

// Funkcja do formatowania dzisiejszej daty w formacie YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Funkcja do formatowania daty w formacie YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const [userName, setUserName] = useState("Jan");
  const [quote, setQuote] = useState("");
  const [tip, setTip] = useState("");
  const [todayPlan, setTodayPlan] = useState<DailyMealPlan | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [recommendedRecipe, setRecommendedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(mealTypes[0].key);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // Pobranie aktualnego dnia
  const todayIndex = (new Date().getDay() + 6) % 7; // Poniedziałek=0, ..., Niedziela=6
  const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
  const today = daysOfWeek[todayIndex];
  const todayDate = getTodayDate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3000/mainPage", {
          withCredentials: true,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Not authenticated, redirecting to login");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Losowanie cytatu i porady
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setTip(tips[Math.floor(Math.random() * tips.length)]);

    // Pobranie mealPlans z localStorage w formacie używanym przez Menu
    const storedMealPlans = localStorage.getItem("mealPlans");
    const mealPlans: { [date: string]: DailyMealPlan } = storedMealPlans ? JSON.parse(storedMealPlans) : {};
    const dailyPlan = mealPlans[todayDate] || mealTypes.reduce((acc, meal) => {
      acc[meal.key] = null;
      return acc;
    }, {} as DailyMealPlan);
    setTodayPlan(dailyPlan);

    // Pobranie favoriteRecipes z localStorage i losowe wybranie 2 przepisów
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const favorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    const randomFavorites = getRandomRecipes(favorites, 2);
    setFavoriteRecipes(randomFavorites);

    // Pobranie losowego przepisu z API
    const fetchRecommendedRecipe = async () => {
      try {
        const response = await axios.get('http://localhost:5000/foodSecret/search?query=a');
        const recipes: Recipe[] = response.data;
        if (recipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * recipes.length);
          setRecommendedRecipe(recipes[randomIndex]);
        }
      } catch (error) {
        console.error('Error fetching recommended recipe:', error);
      }
    };

    fetchRecommendedRecipe();
  }, [todayDate]);

  // Funkcja do otwierania modalu
  const openModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  // Funkcja do zamykania modalu
  const closeModal = () => {
    setSelectedRecipe(null);
    setMessage(null);
    setSelectedDate(null);
  };

  // Funkcja do dodawania do jadłospisu
  const handleAddToMealPlan = () => {
    if (!selectedRecipe || !selectedDate) {
      setMessage("Proszę wybrać datę.");
      return;
    }

    const dateKey = formatDate(selectedDate);
    const stored = localStorage.getItem("mealPlans");
    let mealPlans: { [date: string]: DailyMealPlan } = stored ? JSON.parse(stored) : {};

    if (!mealPlans[dateKey]) {
      mealPlans[dateKey] = mealTypes.reduce((acc, meal) => {
        acc[meal.key] = null;
        return acc;
      }, {} as DailyMealPlan);
    }

    mealPlans[dateKey][selectedMeal] = selectedRecipe;

    localStorage.setItem("mealPlans", JSON.stringify(mealPlans));
    setMessage("Dodano przepis do jadłospisu!");
    setTimeout(() => {
      setMessage(null);
      router.push("/menu");
    }, 2000);
  };

  // Funkcja do dodawania do ulubionych
  const handleAddToFavorites = (recipe: Recipe) => {
    const storedFavorites = localStorage.getItem("favoriteRecipes");
    const currentFavorites: Recipe[] = storedFavorites ? JSON.parse(storedFavorites) : [];
    if (!currentFavorites.some((fav) => fav.id === recipe.id)) {
      const updatedFavorites = [...currentFavorites, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(updatedFavorites));
      setFavoriteRecipes(getRandomRecipes(updatedFavorites, 2));
      setMessage("Dodano przepis do ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage("Przepis jest już w ulubionych!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Pasek nawigacji - pełna szerokość */}
      <Navbar />

      {/* Sekcja powitalna (ograniczona szerokość) */}
      <section className="max-w-276 max-h regl-1 text-center mx-auto py-1 bg-gray-800 shadow-md mt-4 mb-3.5 rounded-lg">
        <h1 className="text-3xl font-bold text-white">Witaj, {userName}!</h1>
        <p className="text-gray-300 mt-2">
          Planuj swoje posiłki i odkrywaj nowe smaki każdego dnia.
        </p>
      </section>

      {/* Pozostała główna zawartość */}
      <div className="max-w-280 mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
        {/* Jadłospis na dziś */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md md:col-span-1 hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Jadłospis na dziś: {today}</h2>
          {todayPlan && Object.values(todayPlan).some((recipe) => recipe !== null) ? (
            <ul className="space-y-2">
              {mealTypes.map((meal) => (
                <li key={meal.key} className="flex justify-between items-center">
                  <span>
                    <strong>{meal.label}:</strong>{" "}
                    {todayPlan[meal.key] ? todayPlan[meal.key]!.name : "Brak przepisu"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-gray-400">Nie masz jeszcze jadłospisu na dziś.</p>
              <SubmitButton type="submit">Ułóż jadłospis</SubmitButton>
            </div>
          )}
          <div>
            <Link href="/shareMenu" className="text-blue-400 text-center mt-4 block hover:underline">
              Udostępnij jadłospis
            </Link>
          </div>
        </section>

        {/* Ulubione przepisy */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2 hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Ulubione przepisy</h2>
          {favoriteRecipes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {favoriteRecipes.map((recipe, index) => (
                <div key={index} className="relative group">
                  <img
                    src={recipe.image || "/placeholder.jpg"}
                    alt={recipe.name}
                    className="w-full h-32 object-cover rounded cursor-pointer group-hover:scale-105 transition-transform"
                    onClick={() => openModal(recipe)}
                  />
                  <p className="text-center mt-2">{recipe.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Brak ulubionych przepisów</p>
          )}
          <Link href="/favorites" className="text-blue-400 text-center mt-4 block hover:underline">
            Zobacz wszystkie ulubione
          </Link>
        </section>

        {/* Polecany przepis */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md md:col-span-1 hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Polecany przepis</h2>
          {recommendedRecipe ? (
            <div className="relative group">
              <img
                src={recommendedRecipe.image || "/placeholder.jpg"}
                alt={recommendedRecipe.name}
                className="w-full h-32 object-cover rounded cursor-pointer group-hover:scale-105 transition-transform"
                onClick={() => openModal(recommendedRecipe)}
              />
              <p className="text-center mt-2">{recommendedRecipe.name}</p>
            </div>
          ) : (
            <p className="text-gray-400">Ładowanie przepisu...</p>
          )}
        </section>
      </div>

      {/* Dodatkowe elementy */}
      <div className="max-w-280 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
        {/* Cytat dnia */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-4 text-white">Cytat dnia</h2>
          <p className="text-gray-300 italic">"{quote}"</p>
        </section>

        {/* Porada kulinarna */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md hover:scale-105 transition-transform">
          <h2 className="text-xl font-semibold mb-4 text-white">Porada kulinarna</h2>
          <p className="text-gray-300">{tip}</p>
        </section>
      </div>

      {/* Modal dla przepisu */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={closeModal}
        >
          <div
            className={`bg-gray-800 p-4 w-250 rounded-lg ${
              selectedRecipe.id === recommendedRecipe?.id ? "w-200" : "max-w-lg"
            } text-white relative overflow-y-auto max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-2">{selectedRecipe.name}</h3>
            <p className="mb-4">{selectedRecipe.description}</p>
            <h4 className="text-xl font-semibold mb-2">Składniki:</h4>
            <div className="grid grid-cols-2 gap-x-4 mb-2 text-sm">
              {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                <div key={index} className="flex">
                  <span className="mr-2">•</span>
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
            <h4 className="text-xl font-semibold mb-2">Instrukcje:</h4>
            <p className="mb-4">{selectedRecipe.instructions}</p>
            {selectedRecipe.id === recommendedRecipe?.id && (
              <div className="mb-4">
                <label className="block mb-1 text-sm">Wybierz datę:</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  dateFormat="dd.MM.yyyy"
                  className="w-full p-1 border rounded bg-gray-700 text-white mb-1 text-sm"
                  placeholderText="Wybierz datę"
                  minDate={new Date()}
                  maxDate={maxDate}
                  locale="pl"
                />
                {selectedDate && (
                  <p className="text-sm mb-1">Wybrana data: {selectedDate.toLocaleDateString("pl-PL")}</p>
                )}
                <label className="block mb-1 text-sm">Wybierz posiłek:</label>
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value as MealType)}
                  className="w-full p-1 border rounded bg-gray-700 text-white mb-1 text-sm"
                >
                  {mealTypes.map((meal) => (
                    <option key={meal.key} value={meal.key}>
                      {meal.label}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={handleAddToMealPlan}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Dodaj do jadłospisu
                  </button>
                  <button
                    onClick={() => handleAddToFavorites(selectedRecipe)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Dodaj do ulubionych
                  </button>
                </div>
                {message && <p className="text-green-400 mt-2 text-sm">{message}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stopka - pełna szerokość */}
      <Footer />
    </div>
  );
};

export default MainPage;
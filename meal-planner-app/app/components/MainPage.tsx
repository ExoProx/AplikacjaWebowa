"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import SubmitButton from './SubmitButton';

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState("Jan"); // Przykład imienia użytkownika z backendu
  const [dailyMenu, setDailyMenu] = useState<string[]>([]); // Jadłospis na dziś
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([
    "Spaghetti Bolognese",
    "Kurczak w sosie curry",
  ]); // Przykładowe ulubione przepisy
  const [quote, setQuote] = useState("Gotowanie to sztuka, którą każdy może opanować!");

  // Symulacja pobierania danych z backendu/API
  useEffect(() => {
    // Tutaj możesz pobrać dane użytkownika, jadłospis na dziś itp.
    // np. fetch('/api/user/menu/today').then(res => setDailyMenu(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="w-32"></div>
          <ul className="flex space-x-6">
            <li>
              <Link href="/recipes" className="hover:underline">
                <SubmitButton type="submit">Przeglądaj przepisy</SubmitButton>
              </Link>
            </li>
            <li>
              <Link href="/menu" className="hover:underline">
                Ułóż jadłospis
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:underline">
                Ulubione przepisy
              </Link>
            </li>
            <li>
              <Link href="/share" className="hover:underline">
                Udostępnij jadłospis
              </Link>
            </li>
          </ul>
          <div>
            <div className="w-40">
              <Link href="/">
                <SubmitButton type="button">Powrót do strony głównej</SubmitButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sekcja powitalna */}
      <section className="text-center py-8 bg-white shadow-md mx-4 mt-4 rounded-lg">
        <h1 className="text-3xl font-bold">Witaj, {userName}!</h1>
        <p className="text-gray-600 mt-2">
          Planuj swoje posiłki i odkrywaj nowe smaki każdego dnia.
        </p>
      </section>

      {/* Główna zawartość */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Jadłospis na dziś */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Jadłospis na dziś</h2>
          {dailyMenu.length > 0 ? (
            <ul className="space-y-2">
              {dailyMenu.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{item}</span>
                  <SubmitButton type="submit">Edytuj</SubmitButton>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-gray-500">Nie masz jeszcze jadłospisu na dziś.</p>
              <SubmitButton type="submit">Ułóż jadłospis</SubmitButton>
            </div>
          )}
        </section>

        {/* Ulubione przepisy */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ulubione przepisy</h2>
          <ul className="space-y-2">
            {favoriteRecipes.map((recipe, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{recipe}</span>
                <SubmitButton type="submit">Dodaj przepis do jadłospisu</SubmitButton>
              </li>
            ))}
          </ul>
          <Link href="/favorites" className="text-blue-500 mt-4 block hover:underline">
            Zobacz wszystkie ulubione
          </Link>
        </section>

        {/* Wyszukiwarka przepisów */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Znajdź przepis</h2>
          <input
            type="text"
            placeholder="Wpisz nazwę przepisu..."
            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
            <SubmitButton type="submit">Szukaj</SubmitButton>
        </section>
      </div>

      {/* Dodatkowe elementy */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Cytat dnia */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cytat dnia</h2>
          <p className="text-gray-700 italic">"{quote}"</p>
        </section>

        {/* Porada kulinarna */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Porada kulinarna</h2>
          <p className="text-gray-700">
            Aby warzywa zachowały więcej smaku, gotuj je na parze zamiast w wodzie!
          </p>
        </section>
      </div>

      {/* Stopka */}
      <footer className="text-center py-4 bg-gray-200 mt-6">
        <p className="text-gray-600">&copy; 2025 Mealio</p>
      </footer>
    </div>
  );
};

export default MainPage;
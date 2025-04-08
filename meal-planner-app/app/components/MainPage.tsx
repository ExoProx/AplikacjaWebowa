"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import SubmitButton from './SubmitButton';
import Navbar from "./Navbar";
import Footer from "./Footer";

const MainPage: React.FC = () => {
  const [userName, setUserName] = useState("Jan");
  const [dailyMenu, setDailyMenu] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([
    "Spaghetti Bolognese",
    "Kurczak w sosie curry",
  ]);
  const [quote, setQuote] = useState("Gotowanie to sztuka, którą każdy może opanować!");

  useEffect(() => {
    // Symulacja pobierania danych z backendu/API
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Pasek nawigacji - pełna szerokość */}
      <Navbar />

      {/* Sekcja powitalna (ograniczona szerokość) */}
      <section className="max-w-276 text-center mx-auto py-6 bg-white shadow-md mt-4 mb-3.5 rounded-lg">
        <h1 className="text-3xl font-bold">Witaj, {userName}!</h1>
        <p className="text-gray-600 mt-2">
          Planuj swoje posiłki i odkrywaj nowe smaki każdego dnia.
        </p>
      </section>

      {/* Pozostała główna zawartość */}
      <div className="max-w-280 mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
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
      <div className="max-w-280 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
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

      {/* Stopka - pełna szerokość */}
      <Footer/>
    </div>
  );
};

export default MainPage;

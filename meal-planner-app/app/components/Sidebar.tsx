"use client";
import { useRouter } from "next/navigation";
import { useSearch } from "@/src/SearchContext";
import React from "react";
const Sidebar = () => {
  const { input, setInput, triggerSearch } = useSearch();
  const router = useRouter();

  const handleSearchClick = () => {
    triggerSearch();
    router.push("/recipes");
  };

  return (
    <div className="w-64 bg-gray-800 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Filtry</h2>
      <input
        type="text"
        placeholder="Szukaj przepisów"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 mb-3 border rounded bg-gray-700 text-white"
      />
      <button onClick={handleSearchClick}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 mb-4"
      >
        Wyszukaj
      </button>
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
          <input type="checkbox" className="mr-2" /> II Śniadanie
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Obiad
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Podwieczorek
        </label>
        <label className="flex items-center text-white">
          <input type="checkbox" className="mr-2" /> Kolacja
        </label>
      </div>
    </div>
  );
};

export default Sidebar;
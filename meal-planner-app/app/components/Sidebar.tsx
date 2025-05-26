"use client";
import React, { useState, useEffect } from "react";
import { useSearch } from "../../src/SearchContext";


const categoriesList = [
  "Breakfast",
  "Lunch",
  "Main Dish",
  "Snack",
];

const Sidebar: React.FC = () => {
  const { input, setInput, categories, toggleCategory, triggerSearch } = useSearch();
  return (
    <div className="w-64 bg-gray-800 shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Filters</h2>
      <input
        type="text"
        placeholder="Search recipes"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full p-2 mb-3 border rounded bg-gray-700 text-white"
      />
      <button onClick={triggerSearch}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 mb-4"
      >
        Search
      </button>
      <h3 className="text-md font-semibold mb-2 text-white">Sort by</h3>
      <select className="w-full p-2 mb-4 border rounded bg-gray-700 text-white">
        <option>Name</option>
        <option>Popularity</option>
        <option>Rating</option>
      </select>
      <h3 className="text-md font-semibold mb-2 text-white">Categories</h3>
      <div className="space-y-2">
         {categoriesList.map(category => (
        <label key={category} className="flex items-center mb-1">
          <input
            type="checkbox"
            checked={categories.includes(category)}
            onChange={() => toggleCategory(category)}
            className="mr-2"
          />
          {category}
        </label>
      ))}
      </div>
    </div>
  );
};

export default Sidebar;
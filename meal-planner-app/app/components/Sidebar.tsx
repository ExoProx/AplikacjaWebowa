"use client";
import React, { useState, useEffect } from "react";
import { useSearch } from "../../src/SearchContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const categoriesList = [
  "Breakfast",
  "Lunch",
  "Main Dish",
  "Snack",
];

const Sidebar: React.FC = () => {
  const { input, setInput, categories, toggleCategory, triggerSearch } = useSearch();
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  return (

    <div className="w-72 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Search Recipes</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-4 pr-10 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            />
            <button
              onClick={triggerSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-white mb-3">Sort by</h3>
          <select className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors duration-200">
            <option>Name</option>
            <option>Popularity</option>
            <option>Rating</option>
          </select>
        </div>

        <div>
          <h3 className="text-md font-semibold text-white mb-3">Categories</h3>
          <div className="space-y-2">
            {categoriesList.map(category => (
              <label key={category} className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="hidden"
                />
                <div className={`w-4 h-4 border rounded transition-colors duration-200 mr-3 flex items-center justify-center ${
                  categories.includes(category)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-600 group-hover:border-blue-500'
                }`}>
                  {categories.includes(category) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm transition-colors duration-200 ${
                  categories.includes(category) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type SearchContextType = {
  input: string;
  setInput: (val: string) => void;
  categories: string[];
  toggleCategory: (val: string) => void;
  query: string;
  triggerSearch: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (input) searchParams.append("query", input);
    if (categories.length > 0) {
      searchParams.append("categories", categories.join(","));
    }
    setQuery(searchParams.toString());
  }, [categories]);

  const triggerSearch = () => {
    const searchParams = new URLSearchParams();
    if (input) searchParams.append("query", input);
    if (categories.length > 0) {
      searchParams.append("recipe_types", categories.join(","));
    }
    setQuery(searchParams.toString());
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };


  return (
    <SearchContext.Provider
      value={{ input, setInput, categories, toggleCategory, query, triggerSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
};
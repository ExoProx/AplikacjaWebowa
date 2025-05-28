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
    if (categories.length > 0) {
      const searchParams = new URLSearchParams();
      searchParams.append("categories", categories.join(","));
      setQuery(searchParams.toString());
    }
  }, [categories]);

  const handleSetInput = (val: string) => {
    setInput(val);
  };

  const triggerSearch = () => {
    if (input || categories.length > 0) {
      const searchParams = new URLSearchParams();
      if (categories.length > 0) {
        searchParams.append("recipe_types", categories.join(","));
      }
      setQuery(input.toLowerCase());
    } else {
      setQuery("");
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <SearchContext.Provider
      value={{ 
        input, 
        setInput: handleSetInput, 
        categories, 
        toggleCategory, 
        query, 
        triggerSearch 
      }}
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
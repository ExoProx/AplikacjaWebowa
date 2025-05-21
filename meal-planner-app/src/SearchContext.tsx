"use client";

import React, { createContext, useContext, useState } from "react";

type SearchContextType = {
  query: string;
  input: string;
  setInput: (val: string) => void;
  triggerSearch: () => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const triggerSearch = () => {
    setQuery(input); // this fires the real fetch
  };

  return (
    <SearchContext.Provider value={{ query, input, setInput, triggerSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
};
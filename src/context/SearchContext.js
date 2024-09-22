'use client';  // Add this line to ensure it's a client component

import React, { createContext, useContext, useState } from 'react';

// Create the context
const SearchContext = createContext();

// Create a provider component
export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');  
  

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}

'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

// Create the context
const SearchContext = createContext();

// Create a provider component
export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');  

  const contextValue = useMemo(() => ({ searchQuery, setSearchQuery }), [searchQuery]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const SearchFilterContext = createContext();

export function useSearchFilter() {
  return useContext(SearchFilterContext);
}

export function SearchFilterProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');

  const defaultFilters = {
    publish: 'all',
  };

  const [filters, setFilters] = useState(defaultFilters);

  const [stats, setStats] = useState([]);
  const [myStats, setMyStats] = useState([]);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleFilterPublish = useCallback(
    (event, newValue) => {
      handleFilters('publish', newValue);
    },
    [handleFilters]
  );

  // Simplifying the arrow body by removing unnecessary block and return statements
  const filteredStats = useMemo(
    () =>
      stats.filter(
        (stat) =>
          stat.tokenSymbol && stat.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [stats, searchQuery]
  );

  const filteredMyStats = useMemo(
    () =>
      myStats.filter(
        (myStat) =>
          myStat.tokenSymbol && myStat.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [myStats, searchQuery]
  );

  const filteredStatsLength = useMemo(() => filteredStats.length, [filteredStats]);
  const filteredMyStatsLength = useMemo(() => filteredMyStats.length, [filteredMyStats]);

  // Memoizing the value object to avoid re-creation on every render
  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      filters,
      handleFilterPublish,
      filteredStats,
      filteredMyStats,
      filteredStatsLength,
      filteredMyStatsLength,
      setStats,
      setMyStats,
    }),
    [searchQuery, filters, filteredStats, filteredMyStats, filteredStatsLength, filteredMyStatsLength]
  );

  return <SearchFilterContext.Provider value={value}>{children}</SearchFilterContext.Provider>;
}

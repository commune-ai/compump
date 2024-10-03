// File: components/SearchBar.js

import React, { useState } from 'react';
import { TextField, InputAdornment, Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles'; // Import useTheme hook

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const theme = useTheme(); // Access the current theme

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch(query);
    }
  };

  const handleSearchClick = () => {
    onSearch(query);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="start" width="100%">
      <TextField
        variant="outlined"
        className='search'
        placeholder="Please enter a symbol name..."
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleSearchClick}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            borderRadius: '50px',  // Rounded corners
            backgroundColor: theme.palette.background.paper, // Dynamic based on theme
            color: theme.palette.text.primary, // Ensure text color follows theme
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 16px',
          },
          '& .MuiSvgIcon-root': {
            color: theme.palette.text.primary, // Search icon color follows theme
          },
        }}
      />
    </Box>
  );
}

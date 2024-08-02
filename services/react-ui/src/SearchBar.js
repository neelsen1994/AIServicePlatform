import React, { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    console.log('Searching for:', query);
    // Implement the search functionality as needed
  };

  return (
    <div style={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '300px', marginRight: '10px' }}
      />
      <button
        onClick={handleSearch}
        style={{ padding: '10px 20px', borderRadius: '4px', backgroundColor: '#007BFF', color: 'white', border: 'none' }}
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;

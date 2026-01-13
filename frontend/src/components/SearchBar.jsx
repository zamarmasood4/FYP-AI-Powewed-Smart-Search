import React, { useState } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ onSearch, placeholder, className, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSearch} className={`w-full transition-all duration-500 ${className}`}>
      <div className={`relative w-full transition-all duration-300 ${isFocused ? "scale-[1.02]" : ""}`}>
        {/* Background Blur Effect (Fixed: pointer-events-none to prevent blocking input) */}
        <div className="absolute inset-0 bg-blue-200 dark:bg-blue-500/20 rounded-full blur-md opacity-20 pointer-events-none"></div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || "Search for anything..."}
          className="w-full h-14 px-6 pr-24 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     shadow-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 focus:outline-none
                     transition-all duration-300 text-lg relative"
          aria-label="Search input"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="submit"
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
            isFocused || query
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

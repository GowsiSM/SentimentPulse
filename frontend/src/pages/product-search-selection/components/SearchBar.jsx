// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, searchQuery, setSearchQuery, isLoading, onLoadProducts }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const categorySearches = [
    { label: "Men's Sports Shoes", query: "mens-footwear-sports-shoes", category: "footwear" },
    { label: "Women's Kurtis", query: "women-apparel-kurtis", category: "apparel" },
    { label: "Mobile Phones", query: "mobiles-mobile-phones", category: "electronics" },
    { label: "Laptops", query: "computers-laptops", category: "electronics" },
    { label: "Home Decor", query: "home-kitchen-wall-decor", category: "home" },
    { label: "Watches", query: "jewellery-watches", category: "accessories" },
    { label: "Kitchen Appliances", query: "home-kitchen-appliances", category: "appliances" },
    { label: "Men's T-Shirts", query: "men-clothing-shirts-t-shirts", category: "apparel" }
  ];

  const recentSearches = [
    "mens-footwear-sports-shoes",
    "women-apparel-kurtis",
    "mobiles-mobile-phones"
  ];

  const filteredSuggestions = categorySearches.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) && 
    item.label.toLowerCase() !== searchQuery.toLowerCase()
  );

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSearchQuery(category.query);
    onSearch(category.query);
    setShowSuggestions(false);
  };

  const handleLoadProductsFromFile = () => {
    onLoadProducts();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Input
              type="search"
              placeholder="Enter Snapdeal category (e.g., mens-footwear-sports-shoes)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e?.target?.value);
                setShowSuggestions(e?.target?.value?.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery?.length > 0 || recentSearches?.length > 0)}
              className="pl-12 pr-20 h-12 text-base"
            />
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!searchQuery?.trim() || isLoading}
                loading={isLoading}
                className="h-8"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (searchQuery?.length > 0 || recentSearches?.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-modal z-50 max-h-80 overflow-y-auto">
            {searchQuery?.length > 0 && filteredSuggestions?.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category Suggestions
                </div>
                {filteredSuggestions?.slice(0, 5)?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-hover flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon name="Package" size={14} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{suggestion.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {suggestion.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery?.length === 0 && recentSearches?.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </div>
                {recentSearches?.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(search);
                      onSearch(search);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-hover flex items-center space-x-2"
                  >
                    <Icon name="Clock" size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2">Or</div>
        <Button
          variant="outline"
          onClick={handleLoadProductsFromFile}
          iconName="FileText"
          iconPosition="left"
          iconSize={16}
        >
          Load Products from JSON File
        </Button>
      </div>

      {/* Popular Categories */}
      <div className="max-w-4xl mx-auto">
        <div className="text-sm font-medium text-foreground mb-3">Popular Categories:</div>
        <div className="flex flex-wrap gap-2">
          {categorySearches.slice(0, 6).map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="px-3 py-2 text-sm bg-muted hover:bg-muted-foreground hover:text-muted rounded-lg transition-colors"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
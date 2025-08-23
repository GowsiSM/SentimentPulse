// snapdeal_sentiment_analyzer/src/pages/product-search-selection/components/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, searchQuery, setSearchQuery, isLoading, onLoadProducts }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const searchRef = useRef(null);

  const categoryData = {
    "men's fashion": {
      label: "Men's Fashion",
      icon: "User",
      items: [
        { label: "Men's Shirts", query: "men-apparel-shirts" },
        { label: "Men's Jackets", query: "men-apparel-outerwear-jackets" },
        { label: "Men's Trackpants & Tracksuits", query: "men-apparel-trackpants-tracksuits" },
        { label: "Men's Wallets", query: "mens-wallets" },
        { label: "Men's Sunglasses", query: "lifestyle-sunglasses" }
      ]
    },
    "women's fashion": {
      label: "Women's Fashion",
      icon: "Heart",
      items: [
        { label: "Women's Sarees", query: "women-apparel-sarees" },
        { label: "Women's Kurtis", query: "women-apparel-stiched-kurtis" },
        { label: "Women's Lehenga", query: "women-apparel-lehenga" },
        { label: "Women's Sandals", query: "womens-footwear-sandal" },
        { label: "Women's Heels & Pumps", query: "womens-footwear-heeled-slipon-pump" },
        { label: "Women's Perfumes", query: "perfumes-women" },
        { label: "Women's Dresses", query: "women-apparel-dresses" },
        { label: "Women's Sweatshirts", query: "women-apparel-sweatshirts" },
        { label: "Handbags & Wallets", query: "lifestyle-handbags-wallets" },
        { label: "Necklaces & Sets", query: "jewelry-necklaces-sets" },
        { label: "Earrings", query: "jewelry-earrings" },
        { label: "Bangles & Bracelets", query: "jewelry-bangles-bracelets" },
        { label: "Hair Accessories", query: "women-hair-accessories" },
        { label: "Stoles & Scarves", query: "women-stoles-scarves" }
      ]
    },
    "kitchen appliances": {
      label: "Kitchen Appliances",
      icon: "ChefHat",
      items: [
        { label: "Juicer Mixer Grinders", query: "appliances-juicer-mixer-grinders" },
        { label: "Gas Stoves & Hobs", query: "appliances-gas-stoves-hobs" },
        { label: "Induction Cookers", query: "appliances-induction-cookers" },
        { label: "Choppers & Blenders", query: "appliances-choppers-blenders" },
        { label: "Sandwich Makers", query: "sandwich-makers" },
        { label: "Cookware & Bakeware", query: "home-kitchen-cookware-bakeware" },
        { label: "Dining & Serving", query: "home-kitchen-dining-serving" },
        { label: "Pressure Cookers", query: "pressure-cookers" },
        { label: "Tea & Coffee Serveware", query: "home-kitchen-tea-coffee-serveware" }
      ]
    },
    "home decor": {
      label: "Home Decor",
      icon: "Home",
      items: [
        { label: "Home Decoratives", query: "home-kitchen-home-decoratives" },
        { label: "Lamps", query: "home-kitchen-lamps" },
        { label: "Wall Decor", query: "home-kitchen-wall-decor" },
        { label: "Home Decor", query: "home-kitchen-home-decor" },
        { label: "Religion & Spirituality", query: "home-kitchen-religion-spirituality" }
      ]
    },
    "beauty products": {
      label: "Beauty Products",
      icon: "Sparkles",
      items: [
        { label: "Makeup Kits", query: "makeup-kits" },
        { label: "Skincare & Perfumes", query: "perfumes-beauty-skin-care" },
        { label: "Bath & Shower", query: "beauty-bath-shower" },
        { label: "Face Makeup", query: "make-up-face" },
        { label: "Eye Makeup", query: "make-up-eyes" },
        { label: "Lip Makeup", query: "make-up-lips" }
      ]
    },
    "computer accessories": {
      label: "Computer Accessories",
      icon: "Monitor",
      items: [
        { label: "Pen Drives", query: "computers-pen-drives" },
        { label: "Keyboards", query: "computers-keyboard" },
        { label: "Computer Mouse", query: "computers-mouse" },
        { label: "Computer Accessories", query: "computers-computer-accessories" },
        { label: "Laptop Skins", query: "laptop-skins" },
        { label: "Gaming Accessories", query: "gaming-accessories" }
      ]
    }
  };

  // Flatten all items for search suggestions
  const allCategoryItems = Object.values(categoryData).flatMap(category => 
    category.items.map(item => ({ ...item, category: category.label.toLowerCase() }))
  );

  const recentSearches = [
    "men-apparel-shirts",
    "women-apparel-kurtis", 
    "appliances-juicer-mixer-grinders"
  ];

  const filteredSuggestions = allCategoryItems.filter(item =>
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

  const handleItemClick = (item) => {
    setSearchQuery(item.query);
    onSearch(item.query);
    setShowSuggestions(false);
    setExpandedCategory(null);
  };

  const handleCategoryClick = (categoryKey) => {
    if (expandedCategory === categoryKey) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryKey);
    }
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
    <div className="space-y-6 bg-white">
      {/* Search Input */}
      <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
        <div className="relative flex-1" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search categories or enter Snapdeal category URL..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e?.target?.value);
                  setShowSuggestions(e?.target?.value?.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchQuery?.length > 0 || recentSearches?.length > 0)}
                className="pl-12 pr-20 h-12 text-base border-2 border-gray-200 focus:border-[#e06a6e] focus:ring-1 focus:ring-[#e06a6e] text-[#333333]"
              />
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5a5a59]" 
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={!searchQuery?.trim() || isLoading}
                  loading={isLoading}
                  className="h-8 bg-[#e06a6e] hover:bg-[#d55a5e] text-white border-0"
                >
                  Search
                </Button>
              </div>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && (searchQuery?.length > 0 || recentSearches?.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchQuery?.length > 0 && filteredSuggestions?.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-medium text-[#5a5a59] uppercase tracking-wide">
                    Category Suggestions
                  </div>
                  {filteredSuggestions?.slice(0, 8)?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-[#e06a6e] hover:bg-opacity-10 rounded-md transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon name="Package" size={14} className="text-[#e06a6e]" />
                        <span className="text-sm text-[#333333]">{suggestion.label}</span>
                      </div>
                      <span className="text-xs text-[#e06a6e] bg-[#e06a6e] bg-opacity-10 px-2 py-1 rounded capitalize">
                        {suggestion.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery?.length === 0 && recentSearches?.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-medium text-[#5a5a59] uppercase tracking-wide">
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
                      className="w-full text-left px-3 py-2 hover:bg-[#e06a6e] hover:bg-opacity-10 rounded-md transition-colors flex items-center space-x-2"
                    >
                      <Icon name="Clock" size={14} className="text-[#e06a6e]" />
                      <span className="text-sm text-[#333333]">{search}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-sm text-[#5a5a59]">or</div>
          <Button
            variant="outline"
            onClick={handleLoadProductsFromFile}
            iconName="FileText"
            iconPosition="left"
            iconSize={16}
            className="h-12 border-2 border-[#e06a6e] border-opacity-30 hover:border-[#e06a6e] hover:text-[#e06a6e] hover:bg-[#e06a6e] hover:bg-opacity-5 text-[#333333] whitespace-nowrap"
          >
            Load JSON
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-lg font-semibold text-[#333333] mb-4 text-center">Browse Categories</div>
        
        {/* Main Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(categoryData).map(([categoryKey, category]) => (
            <div key={categoryKey} className="relative">
              {/* Main Category Button */}
              <button
                onClick={() => handleCategoryClick(categoryKey)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between bg-[#e06a6e] bg-opacity-10 hover:bg-opacity-20 text-[#e40046] border-[#e06a6e] border-opacity-30 hover:border-opacity-60 ${
                  expandedCategory === categoryKey ? 'ring-2 ring-[#e06a6e] ring-offset-2 bg-opacity-20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={category.icon} size={20} />
                  <div className="text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs opacity-75">{category.items.length} categories</div>
                  </div>
                </div>
                <Icon 
                  name={expandedCategory === categoryKey ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="transition-transform duration-200"
                />
              </button>

              {/* Subcategories Dropdown */}
              {expandedCategory === categoryKey && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#e06a6e] border-opacity-30 rounded-lg shadow-lg z-40 max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {category.items.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleItemClick(item)}
                        className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-[#e06a6e] hover:bg-opacity-10 hover:text-[#e06a6e] rounded-md transition-colors flex items-center space-x-2 text-[#333333]"
                      >
                        <Icon name="ArrowRight" size={12} className="opacity-60" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="text-center text-sm text-[#5a5a59]">
          <div className="flex justify-center items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Icon name="Package" size={14} className="text-[#e06a6e]" />
              <span>45 Categories Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Zap" size={14} className="text-[#e06a6e]" />
              <span>Real-time Scraping</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="BarChart3" size={14} className="text-[#e06a6e]" />
              <span>Sentiment Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ForYouSection from '../components/ForYouSection';
// Import the external API-connected dialog
import ProductCompareDialog from '../components/ProductCompareDialog';
import { ShoppingBag, Filter, DollarSign, AlertCircle, Loader2, Scale, History, Clock, Trash2, Sparkles, Brain, ArrowRight, ExternalLink, Star, Package, Shield, Truck, TrendingUp } from 'lucide-react';

// Cache management
const productCache = new Map();
const CACHE_KEY = 'productSearchCache';
const CURRENT_PRODUCTS_KEY = 'currentProductsData';
const HISTORY_KEY = 'productSearchHistory'; 

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyDAqOzI2Sx55tWXiYr7URw7I4uLYl_t2nU";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// Cache keys for Gemini
const GEMINI_CACHE_KEY = 'geminiProductCache';
const RECOMMENDED_PRODUCTS_KEY = 'recommendedProducts';
const GEMINI_RECOMMENDATIONS_KEY = 'geminiProductRecommendations';

// Load cache from localStorage on initial load
const loadCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      parsedCache.forEach(([key, value]) => {
        productCache.set(key, value);
      });
    }
  } catch (error) {
    console.warn('Failed to load cache from storage:', error);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheArray = Array.from(productCache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArray));
  } catch (error) {
    console.warn('Failed to save cache to storage:', error);
  }
};

// Save current products and search state
const saveCurrentState = (products, searchQuery, filters) => {
  try {
    const currentState = {
      products,
      searchQuery,
      filters,
      timestamp: Date.now()
    };
    localStorage.setItem(CURRENT_PRODUCTS_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.warn('Failed to save current state:', error);
  }
};

// Load current products and search state
const loadCurrentState = () => {
  try {
    const saved = localStorage.getItem(CURRENT_PRODUCTS_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      return state;
    }
  } catch (error) {
    console.warn('Failed to load current state:', error);
  }
  return null;
};

// Clear current state (when user explicitly resets)
const clearCurrentState = () => {
  try {
    localStorage.removeItem(CURRENT_PRODUCTS_KEY);
  } catch (error) {
    console.warn('Failed to clear current state:', error);
  }
};

// UPDATED: Generate cache key including user_id
const generateCacheKey = (searchData, userId) => {
  return `${userId || 'guest'}-${searchData.name}-${searchData.minPrice}-${searchData.maxPrice}`.toLowerCase();
};

// Function to get user_id from JWT token
const getUserIdFromToken = () => {
  try {
    // Get token from localStorage
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      console.log('No access token found');
      return null;
    }
    
    // Decode the JWT token to extract user_id
    // JWT tokens are in format: header.payload.signature
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token format');
      return null;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Try different possible field names for user_id
    const userId = payload.user_id || payload.userId || payload.sub || payload.id;
    
    console.log('Extracted user_id from token:', userId);
    return userId;
    
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Function to check if user is authenticated
const checkAuthentication = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Function to generate search URL for a product
const generateProductSearchUrl = (productName, category = '') => {
  const query = encodeURIComponent(`${productName} ${category}`);
  return `https://www.google.com/search?q=${query}+buy&tbm=shop`;
};

// Function to generate Amazon search URL
const generateAmazonProductUrl = (productName) => {
  const query = encodeURIComponent(productName);
  return `https://www.amazon.com/s?k=${query}`;
};

// Function to generate Walmart search URL
const generateWalmartProductUrl = (productName) => {
  const query = encodeURIComponent(productName);
  return `https://www.walmart.com/search?q=${query}`;
};

// Gemini API Function to search for product recommendations
const searchProductsWithGemini = async (searchQuery, minPrice = '', maxPrice = '', userId) => {
  try {
    const cacheKey = `gemini-${userId || 'guest'}-${searchQuery}-${minPrice}-${maxPrice}`.toLowerCase();
    
    // Check cache first
    const cachedGeminiData = localStorage.getItem(GEMINI_CACHE_KEY);
    if (cachedGeminiData) {
      const parsedCache = JSON.parse(cachedGeminiData);
      if (parsedCache[cacheKey]) {
        const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours cache
          console.log('Returning cached Gemini results');
          return parsedCache[cacheKey].products;
        }
      }
    }
    
    console.log('Fetching product recommendations from Gemini...');
    
    // Construct the prompt for Gemini
    const priceRange = minPrice || maxPrice ? 
      `Price Range: $${minPrice || '0'} - $${maxPrice || 'any'}` : 
      'Any Price Range';
    
    const prompt = `You are a shopping assistant and product recommendation expert. Based on the following product search criteria:
    
    Product Search: "${searchQuery}"
    ${priceRange}
    
    Please provide 6-8 alternative or complementary product recommendations that:
    1. Are related to the search query but offer different features or benefits
    2. Are from trusted brands and retailers
    3. Offer good value for money
    4. Have good user reviews and ratings
    5. Are within or close to the specified price range
    
    For each recommendation, provide:
    - Product Name (make it specific and realistic)
    - Brief description (1 sentence highlighting key features)
    - Category (e.g., Electronics, Home & Kitchen, Clothing, etc.)
    - Average Price Range (be realistic)
    - Why it's a good alternative/complement (1 sentence)
    - Brand/Manufacturer (provide real brand names)
    - Key Features (3-4 bullet points)
    - Where to buy (mention 2-3 real retailers)
    - Rating (realistic 1-5 star rating)
    
    Format the response as a JSON array of objects with these exact fields:
    [
      {
        "name": "Specific Product Name",
        "description": "Brief description highlighting key features",
        "category": "Product Category",
        "price": "Realistic price range like $49.99 - $79.99",
        "whyGood": "Why it's a good alternative or complement",
        "brand": "Real Brand Name",
        "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
        "retailers": "Amazon, Walmart, Best Buy",
        "rating": "4.2",
        "shipping": "Free shipping available",
        "warranty": "1-year manufacturer warranty"
      }
    ]
    
    Make the recommendations diverse, practical, and realistic. Use real brand names and retailers.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      }
    };
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and parse the JSON response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    let geminiProducts = [];
    
    if (jsonMatch) {
      try {
        geminiProducts = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Failed to parse Gemini JSON response:', error);
        // Fallback: Create structured data from text
        geminiProducts = createFallbackProducts(searchQuery, minPrice, maxPrice);
      }
    } else {
      // Fallback if no JSON found
      geminiProducts = createFallbackProducts(searchQuery, minPrice, maxPrice);
    }
    
    // Add Gemini-specific metadata and generate product links
    const enhancedProducts = geminiProducts.map((product, index) => {
      // Generate multiple product search links
      const googleUrl = generateProductSearchUrl(product.name, product.category);
      const amazonUrl = generateAmazonProductUrl(product.name);
      const walmartUrl = generateWalmartProductUrl(product.name);
      
      return {
        id: `gemini-${Date.now()}-${index}`,
        name: product.name || `${searchQuery} Alternative`,
        description: product.description || `AI-recommended alternative to ${searchQuery}`,
        brand: product.brand || 'Various Brands',
        category: product.category || 'General',
        price: product.price || 'Price varies',
        rating: product.rating || '4.0',
        features: product.features || ['High quality', 'Good value', 'Popular choice'],
        whyGood: product.whyGood || 'Excellent alternative with great features',
        retailers: product.retailers || 'Amazon, Walmart, Target',
        shipping: product.shipping || 'Shipping options available',
        warranty: product.warranty || 'Manufacturer warranty included',
        isGeminiRecommended: true,
        source: 'gemini-ai',
        // Add product search links
        productLinks: {
          google: googleUrl,
          amazon: amazonUrl,
          walmart: walmartUrl
        },
        // Set primary link (Google shopping as default)
        primaryLink: googleUrl,
        image: `/api/placeholder/300/300?text=${encodeURIComponent(product.name || 'AI Recommended')}`
      };
    });
    
    // Cache the results
    const cachedData = JSON.parse(localStorage.getItem(GEMINI_CACHE_KEY) || '{}');
    cachedData[cacheKey] = {
      products: enhancedProducts,
      timestamp: Date.now(),
      query: { searchQuery, minPrice, maxPrice }
    };
    localStorage.setItem(GEMINI_CACHE_KEY, JSON.stringify(cachedData));
    
    return enhancedProducts;
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Return fallback recommendations with product links
    return createFallbackProducts(searchQuery, minPrice, maxPrice);
  }
};

// Fallback function if Gemini fails - Enhanced with product links
const createFallbackProducts = (searchQuery, minPrice, maxPrice) => {
  const alternatives = [
    `${searchQuery} Pro`,
    `Premium ${searchQuery}`,
    `${searchQuery} with Advanced Features`,
    `Budget ${searchQuery}`,
    `${searchQuery} Alternative`,
    `${searchQuery} Deluxe Edition`,
    `Smart ${searchQuery}`,
    `${searchQuery} Wireless Version`
  ];
  
  const brands = [
    'Samsung, Sony, LG',
    'Apple, Microsoft, Google',
    'Amazon Basics, Anker, Belkin',
    'Dyson, Shark, Bissell',
    'Nike, Adidas, Under Armour',
    'KitchenAid, Cuisinart, Ninja',
    'Dell, HP, Lenovo',
    'Nest, Ring, Arlo'
  ];
  
  const categories = [
    'Electronics',
    'Home & Kitchen',
    'Clothing & Accessories',
    'Health & Beauty',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Automotive'
  ];
  
  return alternatives.map((name, index) => {
    const googleUrl = generateProductSearchUrl(name, categories[index % categories.length]);
    const amazonUrl = generateAmazonProductUrl(name);
    const walmartUrl = generateWalmartProductUrl(name);
    
    return {
      id: `fallback-${Date.now()}-${index}`,
      name,
      description: `AI-recommended alternative to ${searchQuery} with excellent features`,
      brand: brands[index % brands.length],
      category: categories[index % categories.length],
      price: minPrice && maxPrice ? `$${minPrice} - $${maxPrice}` : '$49.99 - $129.99',
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      features: ['High quality materials', 'Excellent customer reviews', 'Great value for money', 'Reliable performance'],
      whyGood: 'Popular alternative with similar features at competitive price',
      retailers: 'Amazon, Walmart, Best Buy',
      shipping: 'Free shipping available',
      warranty: '1-year manufacturer warranty',
      isGeminiRecommended: true,
      source: 'gemini-fallback',
      productLinks: {
        google: googleUrl,
        amazon: amazonUrl,
        walmart: walmartUrl
      },
      primaryLink: googleUrl,
      image: `/api/placeholder/300/300?text=${encodeURIComponent(name)}`
    };
  });
};

// Component: GeminiProductCard - Minimal and structured
const GeminiProductCard = ({ product, index }) => {
  const [showMoreLinks, setShowMoreLinks] = useState(false);
  
  const handleCardClick = (e) => {
    // Only open link if not clicking on the "More options" button
    if (!e.target.closest('.more-options-btn')) {
      window.open(product.primaryLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleLinkClick = (url, e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:shadow-lg group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Card Header with Gradient */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Brain className="h-3 w-3 mr-1" />
                AI Recommended
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {product.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 text-lg">
              {product.name}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreLinks(!showMoreLinks);
            }}
            className="more-options-btn p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More shopping options"
          >
            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-500" />
          </button>
        </div>
        
        {/* Brand and Rating */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
              {product.brand.split(',')[0]}
            </p>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium ml-1">{product.rating}</span>
                <span className="text-xs text-gray-500 ml-1">/5</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <DollarSign className="h-3 w-3" />
              <span>{product.price}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-5 py-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {/* Why Good Section */}
        <div className="flex items-start gap-2 mb-4 p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
          <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-700 dark:text-green-300 flex-1">
            <span className="font-medium">Why consider:</span> {product.whyGood}
          </p>
        </div>
        
        {/* Features Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {product.features.slice(0, 3).map((feature, featureIndex) => (
              <span 
                key={featureIndex} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{product.features.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Shipping and Warranty */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3" />
            <span>{product.shipping}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>{product.warranty}</span>
          </div>
        </div>
      </div>
      
      {/* Product Links Dropdown */}
      {showMoreLinks && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-in slide-in-from-top duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Shop this product on:</p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => handleLinkClick(product.productLinks.google, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">G</span>
              </div>
              <span className="flex-1 text-left">Google Shopping</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            
            <button
              onClick={(e) => handleLinkClick(product.productLinks.amazon, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-yellow-600 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">A</span>
              </div>
              <span className="flex-1 text-left">Amazon</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            
            <button
              onClick={(e) => handleLinkClick(product.productLinks.walmart, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">W</span>
              </div>
              <span className="flex-1 text-left">Walmart</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Action Button */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(product.primaryLink, '_blank', 'noopener,noreferrer');
          }}
          className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
        >
          Shop Now
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

// UPDATED: API function to fetch products with user_id
const fetchProducts = async (searchData, userId) => {
  try {
    // Use environment variable or default to localhost:3001
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const cacheKey = generateCacheKey(searchData, userId);
    
    // Check cache first
    if (productCache.has(cacheKey)) {
      console.log('Returning cached results for:', cacheKey);
      return productCache.get(cacheKey);
    }
    
    const requestBody = {
      query: searchData.name
    };
    
    // ADD user_id to request body if available
    if (userId) {
      requestBody.userId = userId;
      console.log('Sending request with userId:', userId);
    } else {
      console.log('No userId available, sending request without it');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/search/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Also send the Authorization header
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // Handle specific HTTP errors
      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the server.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Process products: ensure all required fields are present
      const processedProducts = (data.results || []).map(product => ({
        ...product,
        // Ensure price is properly formatted
        price: product.price || 'Price not available',
        // Ensure rating is properly formatted
        rating: product.rating || 'No rating',
        // Ensure reviews is properly formatted
        reviews: product.reviews || 'No reviews',
        // Ensure description is properly formatted
        description: product.description || 'No description available',
        // Ensure image has fallback
        image: product.image || '/api/placeholder/200/200',
        // Ensure source is properly formatted
        source: product.source || 'Unknown source'
      }));
      
      // Apply price filtering if specified
      let filteredProducts = processedProducts;
      if (searchData.minPrice || searchData.maxPrice) {
        filteredProducts = processedProducts.filter(product => {
          const priceText = product.price;
          // Extract numeric price from string (e.g., "$9.99" -> 9.99)
          const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
          if (!priceMatch) return true; // Keep products without clear pricing
          
          const price = parseFloat(priceMatch[1]);
          
          const minPrice = searchData.minPrice ? parseFloat(searchData.minPrice) : 0;
          const maxPrice = searchData.maxPrice ? parseFloat(searchData.maxPrice) : Infinity;
          
          return price >= minPrice && price <= maxPrice;
        });
      }
      
      // Cache the processed results
      productCache.set(cacheKey, filteredProducts);
      saveCacheToStorage();
      
      return filteredProducts;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on localhost:3001');
    }
    
    throw error;
  }
};

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: ''
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [error, setError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  // UPDATED: User ID and Authentication State
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Gemini Recommendations State
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [showGeminiSection, setShowGeminiSection] = useState(false);
  
  // Initialize cache and restore state on component mount
  useEffect(() => {
    loadCacheFromStorage();
    
    // Restore previous state if available
    const savedState = loadCurrentState();
    if (savedState) {
      setProducts(savedState.products || []);
      setSearchQuery(savedState.searchQuery || '');
      setFilters(savedState.filters || { minPrice: '', maxPrice: '' });
    }

    // Load History
    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Check authentication and extract user_id
    const checkAuthAndGetUserId = () => {
      const token = localStorage.getItem('access_token');
      const isAuth = !!token;
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const extractedUserId = getUserIdFromToken();
        if (extractedUserId) {
          setUserId(extractedUserId);
          console.log('User authenticated with ID:', extractedUserId);
        } else {
          console.log('User authenticated but could not extract user_id');
        }
      } else {
        console.log('User not authenticated');
        setUserId(null);
      }
    };
    
    checkAuthAndGetUserId();

    // Cleanup: Save cache when component unmounts
    return () => {
      saveCacheToStorage();
    };
  }, []);

  // Save current state whenever products or search criteria change
  useEffect(() => {
    if (products.length > 0 || searchQuery || filters.minPrice || filters.maxPrice) {
      saveCurrentState(products, searchQuery, filters);
    }
  }, [products, searchQuery, filters]);

  // Function to fetch Gemini recommendations
  const fetchGeminiRecommendations = async (query, minPrice, maxPrice) => {
    if (!query) return;
    
    setIsLoadingGemini(true);
    setShowGeminiSection(true);
    
    // Check cache first
    try {
      const cachedData = localStorage.getItem(GEMINI_CACHE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        const cacheKey = `gemini-${userId || 'guest'}-${query}-${minPrice}-${maxPrice}`.toLowerCase();
        
        if (parsedCache[cacheKey]) {
          const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
          if (cacheAge < 24 * 60 * 60 * 1000) {
            setGeminiRecommendations(parsedCache[cacheKey].products);
            setIsLoadingGemini(false);
            return;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load Gemini recommendations from cache:', error);
    }
    
    try {
      const recommendations = await searchProductsWithGemini(query, minPrice, maxPrice, userId);
      setGeminiRecommendations(recommendations);
      
      // Also cache these as general recommendations
      localStorage.setItem(GEMINI_RECOMMENDATIONS_KEY, JSON.stringify({
        products: recommendations,
        timestamp: Date.now(),
        query: { query, minPrice, maxPrice }
      }));
      
    } catch (error) {
      console.error('Failed to fetch Gemini recommendations:', error);
      setGeminiRecommendations([]);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Add to History Function
  const addToHistory = (query, currentFilters) => {
    if (!query) return;
    
    const newEntry = { 
      query, 
      minPrice: currentFilters.minPrice, 
      maxPrice: currentFilters.maxPrice, 
      timestamp: Date.now() 
    };
    
    setSearchHistory(prev => {
      // Remove duplicates (check if query and price filters match)
      const filtered = prev.filter(item => 
        !(item.query.toLowerCase() === query.toLowerCase() && 
          item.minPrice === currentFilters.minPrice && 
          item.maxPrice === currentFilters.maxPrice)
      );
      
      // Add new to top, keep max 5
      const updated = [newEntry, ...filtered].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Fetch Gemini recommendations for this search
    fetchGeminiRecommendations(query, currentFilters.minPrice, currentFilters.maxPrice);
  };

  // Clear History Function
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
  };

  // Apply History Function
  const applyHistoryItem = (item) => {
    // 1. Set State
    setSearchQuery(item.query);
    setFilters({ minPrice: item.minPrice, maxPrice: item.maxPrice });
    
    // 2. Trigger Search
    loadProducts(item.query, { minPrice: item.minPrice, maxPrice: item.maxPrice });
    
    // 3. Fetch Gemini recommendations
    fetchGeminiRecommendations(item.query, item.minPrice, item.maxPrice);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setError('');
    if (query.trim()) {
      // Add to history on search
      addToHistory(query, filters);
      loadProducts(query, filters);
    } else {
      setProducts([]);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  const applyFilters = () => {
    if (searchQuery.trim()) {
      // Add to history when applying filters with a query
      addToHistory(searchQuery, filters);
      loadProducts(searchQuery, filters);
    }
    if (window.innerWidth < 768) {
      setFiltersVisible(false);
    }
  };
  
  const resetSearch = () => {
    setSearchQuery('');
    setFilters({
      minPrice: '',
      maxPrice: ''
    });
    setProducts([]);
    setError('');
    setSelectedProducts([]);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
    
    // Clear the saved state when user explicitly resets
    clearCurrentState();
  };
  
  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: ''
    });
    if (searchQuery.trim()) {
      // Don't necessarily add to history on reset, just load
      loadProducts(searchQuery, {
        minPrice: '',
        maxPrice: ''
      });
    }
  };
  
  // UPDATED: loadProducts function now uses userId
  const loadProducts = async (query, productFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const searchFilters = {
        name: query,
        ...productFilters
      };
      const response = await fetchProducts(searchFilters, userId); // Pass userId
      setProducts(response);
      setSelectedProducts([]); // Reset selected products when new search
      
      // Fetch Gemini recommendations after successful search
      if (response.length > 0) {
        fetchGeminiRecommendations(query, productFilters.minPrice, productFilters.maxPrice);
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      setProducts([]);
      setSelectedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length < 3) { // Limit to 3 products for comparison
          return [...prev, product];
        }
        return prev;
      }
    });
  };

  const openComparisonModal = () => {
    if (selectedProducts.length >= 2) {
      setIsComparisonModalOpen(true);
    }
  };

  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Shop Smart, Save More</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compare prices across multiple platforms and find the best deals on your favorite products.
          </p>
          
          {/* Show authentication status */}
          {!isAuthenticated && (
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-700 dark:text-yellow-300 text-sm">
                  You are not logged in. Your search history will not be saved.
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Comparison Bar */}
        {selectedProducts.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top-4 duration-300 sticky top-24 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-3">
                {selectedProducts.length >= 2 ? (
                  <button
                    onClick={openComparisonModal}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 font-medium text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Compare
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 italic">Select at least 2 to compare</span>
                )}
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-3 py-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mb-8">
          <SearchBar 
            onSearch={handleSearch}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products, brands, or categories..."
            className="scale-in"
          />
          
          {/* Search History Section */}
          {searchHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <History className="h-3 w-3" /> Recent Searches
                </h3>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => applyHistoryItem(item)}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm"
                  >
                    <Clock className="h-3 w-3 text-gray-400 group-hover:text-emerald-500" />
                    <span className="font-medium">{item.query}</span>
                    {(item.minPrice || item.maxPrice) && (
                      <span className="text-xs text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2 ml-1">
                        {item.minPrice ? `$${item.minPrice}` : '$0'} - {item.maxPrice ? `$${item.maxPrice}` : '∞'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Mobile Toggle */}
          <div className="md:hidden flex justify-center mb-4">
            <button 
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm"
            >
              <Filter className="h-4 w-4" />
              <span>{filtersVisible ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
          
          {/* Filters Sidebar */}
          <div 
            className={`w-full md:w-64 glass-card p-4 rounded-xl md:sticky md:top-24 h-fit transition-all duration-300 ${
              filtersVisible ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <div className="flex gap-2">
                <button 
                  onClick={resetFilters}
                  className="text-sm text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={resetSearch}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={applyFilters}
                disabled={!searchQuery.trim() || isLoading}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? 'Applying...' : 'Apply Filters'}
              </button>
            </div>
          </div>
          
          {/* Product Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <SearchResults 
                isLoading={isLoading} 
                results={products} 
                emptyMessage={
                  products.length === 0 && !error
                    ? "Search for products above to see results." 
                    : "No products match your search criteria. Try adjusting your filters or search query."
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ProductCard 
                      key={product.id || index} 
                      product={product} 
                      isSelected={selectedProducts.some(p => p.id === product.id)}
                      onSelect={() => toggleProductSelection(product)}
                      showVisitSiteButton={true}
                      userId={userId}
                      onTrackVisit={() => {
                        // Track product visit if needed
                        console.log('Product visited:', product.id, 'by user:', userId);
                      }}
                    />
                  ))}
                </div>
              </SearchResults>
            )}

            {/* Gemini AI Recommendations Section */}
            {showGeminiSection && !isLoading && (
              <div className="max-w-7xl mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card p-5 sm:p-6 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800/30 bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-md">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Shopping Recommendations</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Gemini AI suggests these alternatives and complementary products
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowGeminiSection(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Hide
                      </button>
                      <button
                        onClick={() => fetchGeminiRecommendations(searchQuery, filters.minPrice, filters.maxPrice)}
                        disabled={isLoadingGemini}
                        className="text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {isLoadingGemini ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                        Refresh AI
                      </button>
                    </div>
                  </div>
                  
                  {isLoadingGemini ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                          <div className="flex gap-2 mb-4">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : geminiRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {geminiRecommendations.slice(0, 6).map((product, index) => (
                        <GeminiProductCard key={`gemini-${index}`} product={product} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                        <Brain className="h-6 w-6 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No AI Recommendations Yet</h4>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Perform a product search to get AI-powered shopping recommendations tailored to your criteria.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Note:</span> These are AI-generated suggestions based on your search for "{searchQuery}" 
                        {filters.minPrice || filters.maxPrice ? ` within price range $${filters.minPrice || '0'} - $${filters.maxPrice || 'any'}` : ''}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-blue-500" />
                          <span className="text-gray-500 dark:text-gray-400">Alternatives & Complements</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            
          </div>
        </div>
      </div>

      {/* Comparison Modal - Connected to External Component */}
      <ProductCompareDialog
        isOpen={isComparisonModalOpen}
        onClose={closeComparisonModal}
        products={selectedProducts}
      />
    </div>
  );
};

export default ProductSearch;
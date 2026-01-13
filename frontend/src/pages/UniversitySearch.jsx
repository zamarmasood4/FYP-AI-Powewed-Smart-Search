import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import UniversityCard from '../components/UniversityCard';
import ScholarshipCard from '../components/ScholarshipCard';
import UniversityCardSkeleton from '../components/UniversityCardSkeleton';
import ForYouSection from '../components/ForYouSection';
import { GraduationCap, Filter, MapPin, Globe, Tag, Search, X, ChevronDown, AlertCircle, History, Clock, Trash2, Sparkles, ArrowRight, Brain, ExternalLink, BookOpen, Users, Award, DollarSign, Calendar, TrendingUp, Loader2 } from 'lucide-react';

// Cache management
const searchCache = new Map();
const CACHE_KEY = 'universitySearchCache';
const CURRENT_SEARCH_KEY = 'currentUniversitySearchData';
const HISTORY_KEY = 'universitySearchHistory';

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyDAqOzI2Sx55tWXiYr7URw7I4uLYl_t2nU";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// Cache keys for Gemini
const GEMINI_CACHE_KEY = 'geminiUniversityCache';
const GEMINI_RECOMMENDATIONS_KEY = 'geminiUniversityRecommendations';

// Load cache from localStorage on initial load
const loadCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      parsedCache.forEach(([key, value]) => {
        searchCache.set(key, value);
      });
    }
  } catch (error) {
    console.warn('Failed to load cache from storage:', error);
  }
};

// Save cache to localStorage
const saveCacheToStorage = () => {
  try {
    const cacheArray = Array.from(searchCache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArray));
  } catch (error) {
    console.warn('Failed to save cache to storage:', error);
  }
};

// Save current search state
const saveCurrentState = (universities, scholarships, searchData, activeTab, filters) => {
  try {
    const currentState = {
      universities,
      scholarships,
      searchData,
      activeTab,
      filters,
      timestamp: Date.now()
    };
    localStorage.setItem(CURRENT_SEARCH_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.warn('Failed to save current state:', error);
  }
};

// Load current search state
const loadCurrentState = () => {
  try {
    const saved = localStorage.getItem(CURRENT_SEARCH_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Check if data is not too old (24 hours)
      const isDataFresh = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;
      return isDataFresh ? state : null;
    }
  } catch (error) {
    console.warn('Failed to load current state:', error);
  }
  return null;
};

// Clear current state (when user explicitly resets)
const clearCurrentState = () => {
  try {
    localStorage.removeItem(CURRENT_SEARCH_KEY);
  } catch (error) {
    console.warn('Failed to clear current state:', error);
  }
};

// UPDATED: Generate cache key including user_id
const generateCacheKey = (searchData, activeTab, userId) => {
  return `${userId || 'guest'}-${activeTab}-${searchData.country}-${searchData.studyLevel}-${searchData.field}`.toLowerCase();
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

// Function to generate university search URLs
const generateUniversitySearchUrl = (universityName, country, field = '') => {
  const query = encodeURIComponent(`${universityName} ${field} ${country} university programs`);
  return `https://www.google.com/search?q=${query}`;
};

// Function to generate scholarship search URLs
const generateScholarshipSearchUrl = (field, country, level) => {
  const query = encodeURIComponent(`${field} ${level} scholarships ${country}`);
  return `https://www.google.com/search?q=${query}`;
};

// Gemini API Function to get university recommendations
const getUniversityRecommendationsFromGemini = async (country, studyLevel, field, userId) => {
  try {
    const cacheKey = `gemini-university-${userId || 'guest'}-${country}-${studyLevel}-${field}`.toLowerCase();
    
    // Check cache first
    const cachedGeminiData = localStorage.getItem(GEMINI_CACHE_KEY);
    if (cachedGeminiData) {
      const parsedCache = JSON.parse(cachedGeminiData);
      if (parsedCache[cacheKey]) {
        const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours cache
          console.log('Returning cached Gemini university results');
          return parsedCache[cacheKey].recommendations;
        }
      }
    }
    
    console.log('Fetching university recommendations from Gemini...');
    
    // Construct the prompt for Gemini
    const prompt = `You are an education advisor and university search expert. Based on the following search criteria:
    
    Country: "${country}"
    Study Level: "${studyLevel}"
    Field of Study: "${field}"
    
    Please provide 3-4 alternative university and program recommendations that:
    1. Are excellent for the selected field but in different locations
    2. Have strong programs in the specified field
    3. Offer good scholarship opportunities for international students
    4. Have good career outcomes and industry connections
    
    For each recommendation, provide:
    - University Name
    - Location (City, Country)
    - Why it's a good alternative (1-2 sentences)
    - Program Strength (e.g., "Top 10 in the world for Computer Science")
    - Estimated Tuition Range (per year in USD)
    - Scholarship Availability (High/Medium/Low)
    - Key Features (e.g., "Strong industry partnerships", "Research-focused", "Entrepreneurship support")
    
    Format the response as a JSON array of objects with these fields:
    [
      {
        "name": "University Name",
        "location": "City, Country",
        "whyGood": "Why it's a good alternative",
        "programStrength": "Program strength description",
        "tuition": "Tuition range",
        "scholarshipAvailability": "High/Medium/Low",
        "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
        "type": "Public/Private/Research University",
        "ranking": "World ranking if known",
        "field": "${field}"
      }
    ]
    
    Make the recommendations diverse, practical, and realistic. Include both well-known and emerging universities.`;

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
        maxOutputTokens: 1500, // Reduced to prevent rate limiting
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
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and parse the JSON response
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    let geminiRecommendations = [];
    
    if (jsonMatch) {
      try {
        geminiRecommendations = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Failed to parse Gemini JSON response:', error);
        // Fallback: Create structured data from text
        geminiRecommendations = createFallbackUniversityRecommendations(country, studyLevel, field);
      }
    } else {
      // Fallback if no JSON found
      geminiRecommendations = createFallbackUniversityRecommendations(country, studyLevel, field);
    }
    
    // Add Gemini-specific metadata and generate URLs
    const enhancedRecommendations = geminiRecommendations.map((rec, index) => {
      const searchUrl = generateUniversitySearchUrl(rec.name, rec.location, field);
      
      return {
        id: `gemini-uni-${Date.now()}-${index}`,
        name: rec.name || `Top University for ${field}`,
        location: rec.location || `${country}`,
        whyGood: rec.whyGood || `Excellent ${field} program in ${country}`,
        programStrength: rec.programStrength || 'Strong program in selected field',
        tuition: rec.tuition || '$15,000 - $30,000 per year',
        scholarshipAvailability: rec.scholarshipAvailability || 'Medium',
        keyFeatures: rec.keyFeatures || ['Research opportunities', 'International student support', 'Industry connections'],
        type: rec.type || 'Research University',
        ranking: rec.ranking || 'Top 200 globally',
        field: field,
        studyLevel: studyLevel,
        isGeminiRecommended: true,
        source: 'gemini-ai',
        searchUrl: searchUrl
      };
    });
    
    // Cache the results
    const cachedData = JSON.parse(localStorage.getItem(GEMINI_CACHE_KEY) || '{}');
    cachedData[cacheKey] = {
      recommendations: enhancedRecommendations,
      timestamp: Date.now(),
      query: { country, studyLevel, field }
    };
    localStorage.setItem(GEMINI_CACHE_KEY, JSON.stringify(cachedData));
    
    return enhancedRecommendations;
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Return fallback recommendations
    return createFallbackUniversityRecommendations(country, studyLevel, field);
  }
};

// Fallback function if Gemini fails
const createFallbackUniversityRecommendations = (country, studyLevel, field) => {
  const recommendations = [
    {
      id: `fallback-uni-${Date.now()}-1`,
      name: `University of ${country.split(' ')[0]}`,
      location: `${country.split(' ')[0]}, ${country}`,
      whyGood: `Leading public university with strong ${field} programs and research opportunities`,
      programStrength: `Top-ranked ${field} program in the country`,
      tuition: '$10,000 - $25,000 per year',
      scholarshipAvailability: 'High',
      keyFeatures: ['Research-focused', 'Industry partnerships', 'International student office'],
      type: 'Public Research University',
      ranking: 'Top 100 globally',
      field: field,
      studyLevel: studyLevel,
      isGeminiRecommended: true,
      source: 'gemini-fallback',
      searchUrl: generateUniversitySearchUrl(`University of ${country.split(' ')[0]}`, country, field)
    },
    {
      id: `fallback-uni-${Date.now()}-2`,
      name: `${country.split(' ')[0]} Institute of Technology`,
      location: 'Major City, ' + country,
      whyGood: `Technical university with excellent ${field} programs and strong industry connections`,
      programStrength: `Specialized ${field} curriculum with practical focus`,
      tuition: '$20,000 - $35,000 per year',
      scholarshipAvailability: 'Medium',
      keyFeatures: ['Technical focus', 'Startup incubation', 'Career services'],
      type: 'Technical University',
      ranking: 'Top 150 globally',
      field: field,
      studyLevel: studyLevel,
      isGeminiRecommended: true,
      source: 'gemini-fallback',
      searchUrl: generateUniversitySearchUrl(`${country.split(' ')[0]} Institute of Technology`, country, field)
    },
    {
      id: `fallback-uni-${Date.now()}-3`,
      name: 'Global International University',
      location: 'Capital City, ' + country,
      whyGood: `Comprehensive university with diverse ${field} programs and international student community`,
      programStrength: `Interdisciplinary ${field} programs with global perspective`,
      tuition: '$15,000 - $28,000 per year',
      scholarshipAvailability: 'High',
      keyFeatures: ['International community', 'Study abroad programs', 'Research centers'],
      type: 'Comprehensive University',
      ranking: 'Top 200 globally',
      field: field,
      studyLevel: studyLevel,
      isGeminiRecommended: true,
      source: 'gemini-fallback',
      searchUrl: generateUniversitySearchUrl('Global International University', country, field)
    }
  ];
  
  return recommendations;
};

// Function to load Gemini recommendations from cache
const loadGeminiRecommendationsFromCache = (country, studyLevel, field) => {
  try {
    const cachedData = localStorage.getItem(GEMINI_CACHE_KEY);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      const cacheKey = `gemini-university-guest-${country}-${studyLevel}-${field}`.toLowerCase();
      
      if (parsedCache[cacheKey]) {
        const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return parsedCache[cacheKey].recommendations;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load Gemini recommendations from cache:', error);
  }
  return null;
};

// New Component: GeminiUniversityCard
const GeminiUniversityCard = ({ recommendation, index }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  
  const handleCardClick = (e) => {
    // Only open link if not clicking on the "More info" button
    if (!e.target.closest('.more-info-btn')) {
      window.open(recommendation.searchUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleSearchClick = (e) => {
    e.stopPropagation();
    window.open(recommendation.searchUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-lg group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Card Header with Gradient */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Brain className="h-3 w-3 mr-1" />
                AI Recommended
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {recommendation.type}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1 text-lg">
              {recommendation.name}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreInfo(!showMoreInfo);
            }}
            className="more-info-btn p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More information"
          >
            <BookOpen className="h-4 w-4 text-gray-400 hover:text-indigo-500" />
          </button>
        </div>
        
        {/* Location and Ranking */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-3.5 w-3.5" />
            <span>{recommendation.location}</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <Award className="h-3 w-3" />
              <span>{recommendation.ranking}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-5 py-4">
        {/* Program Strength */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {recommendation.field} Program
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {recommendation.programStrength}
          </p>
        </div>
        
        {/* Why Good Section */}
        <div className="flex items-start gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
          <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
            <span className="font-medium">Why consider:</span> {recommendation.whyGood}
          </p>
        </div>
        
        {/* Key Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {recommendation.keyFeatures.slice(0, 3).map((feature, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
            {recommendation.keyFeatures.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{recommendation.keyFeatures.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Tuition and Scholarship */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            <span>{recommendation.tuition}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            recommendation.scholarshipAvailability === 'High' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : recommendation.scholarshipAvailability === 'Medium'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            <Users className="h-2.5 w-2.5 inline mr-1" />
            {recommendation.scholarshipAvailability} scholarships
          </div>
        </div>
      </div>
      
      {/* More Info Dropdown */}
      {showMoreInfo && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-in slide-in-from-top duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Study Level:</p>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{recommendation.studyLevel}</span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Search for this university:</p>
          <button
            onClick={handleSearchClick}
            className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            Search Programs
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      
      {/* Action Button */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleSearchClick}
          className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"
        >
          Explore University
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const UniversitySearch = () => {
  const [searchData, setSearchData] = useState({
    country: '',
    studyLevel: '',
    field: ''
  });
  const [filters, setFilters] = useState({
    location: '',
    country: '',
    city: '',
    subject: '',
    level: ''
  });
  const [universities, setUniversities] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('universities');
  const [apiError, setApiError] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  // UPDATED: User ID and Authentication State
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Gemini Recommendations State
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [showGeminiSection, setShowGeminiSection] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  
  // Refs for click outside detection
  const countryDropdownRef = useRef(null);
  
  // Mock data for when API is not available
  const mockUniversities = [
    {
      id: 1,
      title: "Massachusetts Institute of Technology",
      location: "Cambridge, Massachusetts",
      ranking: "1",
      description: "World-renowned institution for technology and engineering education with cutting-edge research facilities.",
      url: "https://www.mit.edu",
      image: null,
      type: "university",
      source: "UniRank",
      studyLevel: "PhD Programs",
      field: "Computer Science, Engineering, Physics",
      fields: ["Computer Science", "Engineering", "Physics", "Mathematics"],
      programs: [
        {
          name: "Computer Science PhD",
          level: "PhD Programs",
          duration: "5-6 years",
          type: "Full-time"
        },
        {
          name: "Electrical Engineering PhD",
          level: "PhD Programs", 
          duration: "5-6 years",
          type: "Full-time"
        }
      ],
      acceptance: "7%"
    },
    {
      id: 2,
      title: "Stanford University",
      location: "Stanford, California", 
      ranking: "2",
      description: "Leading research university in the heart of Silicon Valley with strong industry connections.",
      url: "https://www.stanford.edu",
      image: null,
      type: "university",
      source: "UniRank",
      studyLevel: "PhD Programs",
      field: "Business, Medicine, Law",
      fields: ["Business", "Medicine", "Law", "Computer Science"],
      programs: [
        {
          name: "Business Administration PhD",
          level: "PhD Programs",
          duration: "4-5 years", 
          type: "Full-time"
        }
      ],
      acceptance: "4%"
    }
  ];

  // Country options
  const countries = [
    'United States of America',
    'United Kingdom', 
    'France',
    'Germany',
    'Austria',
    'Pakistan',
    'India',
    'Canada',
    'Australia'
  ];

  // Study level options
  const studyLevels = ['Undergraduate', 'Graduate', 'Masters', 'PhD', 'Certificate', 'all'];

  // Field options
  const fields = [
    'all',
    'Computer Science',
    'Engineering',
    'Business',
    'Medicine',
    'Arts', 
    'Science',
    'Environmental Science',
    'Human Rights Law',
    'Aerospace Engineering'
  ];

  // Function to fetch Gemini recommendations
  const fetchGeminiRecommendations = async (country, studyLevel, field) => {
    if (!country || !studyLevel || !field || field === 'all') return;
    
    setIsLoadingGemini(true);
    setGeminiError('');
    setShowGeminiSection(true);
    
    // Check cache first
    const cachedRecommendations = loadGeminiRecommendationsFromCache(country, studyLevel, field);
    if (cachedRecommendations) {
      setGeminiRecommendations(cachedRecommendations);
      setIsLoadingGemini(false);
      return;
    }
    
    try {
      const userId = getUserIdFromToken();
      const recommendations = await getUniversityRecommendationsFromGemini(country, studyLevel, field, userId);
      setGeminiRecommendations(recommendations);
      
      // Also cache these as general recommendations
      localStorage.setItem(GEMINI_RECOMMENDATIONS_KEY, JSON.stringify({
        recommendations: recommendations,
        timestamp: Date.now(),
        query: { country, studyLevel, field }
      }));
      
    } catch (error) {
      console.error('Failed to fetch Gemini recommendations:', error);
      setGeminiError(error.message);
      
      // Use fallback recommendations
      const fallbackRecommendations = createFallbackUniversityRecommendations(country, studyLevel, field);
      setGeminiRecommendations(fallbackRecommendations);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  // Initialize cache and restore state on component mount
  useEffect(() => {
    loadCacheFromStorage();
    
    // Restore previous state if available
    const savedState = loadCurrentState();
    if (savedState) {
      setUniversities(savedState.universities || []);
      setScholarships(savedState.scholarships || []);
      setSearchData(savedState.searchData || { country: '', studyLevel: '', field: '' });
      setActiveTab(savedState.activeTab || 'universities');
      setFilters(savedState.filters || { location: '', country: '', city: '', subject: '', level: '' });
      setCountrySearch(savedState.searchData?.country || '');
      
      // Fetch Gemini recommendations if we have saved state
      if (savedState.searchData?.country && savedState.searchData?.studyLevel && savedState.searchData?.field) {
        fetchGeminiRecommendations(
          savedState.searchData.country,
          savedState.searchData.studyLevel,
          savedState.searchData.field
        );
      }
    } else {
      // Load initial data when component mounts if no saved state
      const initialSearchData = {
        country: 'United States of America',
        studyLevel: 'PhD',
        field: 'all'
      };
      setSearchData(initialSearchData);
      setCountrySearch(initialSearchData.country);
      loadUniversities(initialSearchData);
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

  // Save current state whenever data changes
  useEffect(() => {
    if (universities.length > 0 || scholarships.length > 0 || searchData.country || searchData.studyLevel || searchData.field) {
      saveCurrentState(universities, scholarships, searchData, activeTab, filters);
    }
  }, [universities, scholarships, searchData, activeTab, filters]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add to History Function
  const addToHistory = (params, tab) => {
    const newEntry = { 
      country: params.country,
      studyLevel: params.studyLevel,
      field: params.field,
      activeTab: tab,
      timestamp: Date.now() 
    };
    
    setSearchHistory(prev => {
      // Remove duplicates (check if all fields and tab match)
      const filtered = prev.filter(item => 
        !(item.country === params.country && 
          item.studyLevel === params.studyLevel && 
          item.field === params.field &&
          item.activeTab === tab)
      );
      
      // Add new to top, keep max 5
      const updated = [newEntry, ...filtered].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Fetch Gemini recommendations when adding to history
    if (params.country && params.studyLevel && params.field && params.field !== 'all') {
      fetchGeminiRecommendations(params.country, params.studyLevel, params.field);
    }
  };

  // Clear History Function
  const clearHistory = () => {
    setSearchHistory([]);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(GEMINI_RECOMMENDATIONS_KEY);
  };

  // Apply History Function
  const applyHistoryItem = (item) => {
    // 1. Set State
    setSearchData({
      country: item.country,
      studyLevel: item.studyLevel,
      field: item.field
    });
    setCountrySearch(item.country);
    setActiveTab(item.activeTab);
    
    // 2. Trigger Search based on the tab saved in history
    if (item.activeTab === 'universities') {
      loadUniversities({ country: item.country, studyLevel: item.studyLevel, field: item.field });
    } else {
      loadScholarships({ country: item.country, studyLevel: item.studyLevel, field: item.field });
    }
    
    // 3. Fetch Gemini recommendations
    if (item.field !== 'all') {
      fetchGeminiRecommendations(item.country, item.studyLevel, item.field);
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleSearch = () => {
    // Add to history when search button is clicked
    if (!isSearchDisabled) {
      addToHistory(searchData, activeTab);
    }

    if (activeTab === 'universities') {
      loadUniversities(searchData);
    } else {
      loadScholarships(searchData);
    }
  };

  const handleSearchDataChange = (field, value) => {
    const newSearchData = { ...searchData, [field]: value };
    setSearchData(newSearchData);
    
    if (field === 'country') {
      setCountrySearch(value);
    }
    
    // Auto-search when all fields are filled
    if (newSearchData.country && newSearchData.studyLevel && newSearchData.field) {
      // Add to history on auto-search
      addToHistory(newSearchData, activeTab);
      
      if (activeTab === 'universities') {
        loadUniversities(newSearchData);
      } else {
        loadScholarships(newSearchData);
      }
    }
  };

  const handleCountrySelect = (country) => {
    setSearchData(prev => ({ ...prev, country }));
    setCountrySearch(country);
    setShowCountryDropdown(false);
    
    // Auto-search if other fields are filled
    if (searchData.studyLevel && searchData.field) {
      const newSearchData = { ...searchData, country };
      // Add to history
      addToHistory(newSearchData, activeTab);

      if (activeTab === 'universities') {
        loadUniversities(newSearchData);
      } else {
        loadScholarships(newSearchData);
      }
    }
  };

  const handleCountrySearchChange = (e) => {
    setCountrySearch(e.target.value);
    setShowCountryDropdown(true);
  };

  const clearCountry = () => {
    setCountrySearch('');
    setSearchData(prev => ({ ...prev, country: '' }));
    setShowCountryDropdown(false);
  };
  
  // UPDATED: loadUniversities function with user_id
  const loadUniversities = async (searchParams) => {
    setIsLoading(true);
    setApiError('');
    
    const cacheKey = generateCacheKey(searchParams, 'universities', userId);
    
    try {
      // Check cache first
      if (searchCache.has(cacheKey)) {
        console.log('Returning cached university results for:', cacheKey);
        setUniversities(searchCache.get(cacheKey));
        setIsLoading(false);
        return;
      }

      // Prepare API request body with user_id
      const requestBody = {
        country: searchParams.country.toLowerCase() === 'united states of america' ? 'usa' : searchParams.country.toLowerCase(),
        studyLevel: searchParams.studyLevel.toLowerCase(),
        field: searchParams.field.toLowerCase()
      };
      
      // ADD user_id to request body if available
      if (userId) {
        requestBody.userId = userId;
        console.log('Sending university request with userId:', userId);
      } else {
        console.log('No userId available for university search');
      }

      console.log('Sending university request to API:', requestBody);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/search/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Also send the Authorization header
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('University API Response:', apiResponse);
      
      // Extract universities from the results property
      const universityResults = apiResponse?.results || [];
      
      // Handle both single object and array responses
      let processedResults = [];
      if (universityResults) {
        if (Array.isArray(universityResults)) {
          processedResults = universityResults;
        } else {
          processedResults = [universityResults];
        }
      }
      
      console.log('Processed universities:', processedResults);
      setUniversities(processedResults);
      
      // Cache the results
      searchCache.set(cacheKey, processedResults);
      saveCacheToStorage();
      
    } catch (error) {
      console.error('Error fetching universities:', error);
      setApiError(`Unable to connect to server. Using demo data. Error: ${error.message}`);
      
      // Use mock data as fallback
      const filteredMockData = mockUniversities.filter(uni => {
        const matchesCountry = !searchParams.country || 
          uni.location.toLowerCase().includes(searchParams.country.toLowerCase());
        const matchesField = !searchParams.field || searchParams.field === 'all' ||
          uni.fields.some(field => 
            field.toLowerCase().includes(searchParams.field.toLowerCase())
          );
        return matchesCountry && matchesField;
      });
      
      setUniversities(filteredMockData);
      
      // Cache the mock results too
      searchCache.set(cacheKey, filteredMockData);
      saveCacheToStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATED: loadScholarships function with user_id
  const loadScholarships = async (searchParams) => {
    setIsLoading(true);
    setApiError('');
    
    const cacheKey = generateCacheKey(searchParams, 'scholarships', userId);
    
    try {
      // Check cache first
      if (searchCache.has(cacheKey)) {
        console.log('Returning cached scholarship results for:', cacheKey);
        setScholarships(searchCache.get(cacheKey));
        setIsLoading(false);
        return;
      }

      // Prepare API request body with user_id
      const requestBody = {
        country: searchParams.country.toLowerCase() === 'united states of america' ? 'usa' : searchParams.country.toLowerCase(),
        studyLevel: searchParams.studyLevel.toLowerCase(),
        field: searchParams.field.toLowerCase()
      };
      
      // ADD user_id to request body if available
      if (userId) {
        requestBody.userId = userId;
        console.log('Sending scholarship request with userId:', userId);
      } else {
        console.log('No userId available for scholarship search');
      }

      console.log('Sending scholarship request to API:', requestBody);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_BASE_URL}/api/search/scholarships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Also send the Authorization header
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('Scholarship API Response:', apiResponse);
      
      // Extract scholarships from the results property
      const scholarshipResults = apiResponse?.results || [];
      
      console.log('Processed scholarships:', scholarshipResults);
      setScholarships(scholarshipResults);
      
      // Cache the results
      searchCache.set(cacheKey, scholarshipResults);
      saveCacheToStorage();
      
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setApiError(`Unable to connect to scholarships server. Error: ${error.message}`);
      
      // Fallback to empty array since we don't have mock scholarship data
      setScholarships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'universities' && searchData.country && searchData.studyLevel && searchData.field) {
      loadUniversities(searchData);
    } else if (tab === 'scholarships' && searchData.country && searchData.studyLevel && searchData.field) {
      loadScholarships(searchData);
    } else {
      // Clear results when switching tabs without search criteria
      if (tab === 'universities') {
        setUniversities([]);
      } else {
        setScholarships([]);
      }
    }
  };

  const handleTagClick = (filterType, value) => {
    let newSearchData = { ...searchData };
    
    if (filterType === 'country') {
      newSearchData.country = value;
      setSearchData(newSearchData);
      setCountrySearch(value);
    } else if (filterType === 'subject') {
      newSearchData.field = value;
      setSearchData(newSearchData);
    } else if (filterType === 'level') {
      newSearchData.studyLevel = value;
      setSearchData(newSearchData);
    }

    // Check if we have all required fields to trigger a search
    if (newSearchData.country && newSearchData.studyLevel && newSearchData.field) {
      setTimeout(() => {
        // Add to history on tag click (if full search triggered)
        addToHistory(newSearchData, activeTab);

        if (activeTab === 'universities') {
          loadUniversities(newSearchData);
        } else {
          loadScholarships(newSearchData);
        }
      }, 100);
    }
  };

  const resetSearch = () => {
    setSearchData({
      country: '',
      studyLevel: '',
      field: ''
    });
    setCountrySearch('');
    setUniversities([]);
    setScholarships([]);
    setFilters({
      location: '',
      country: '',
      city: '',
      subject: '',
      level: ''
    });
    setApiError('');
    setShowCountryDropdown(false);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
    setGeminiError('');
    
    // Clear the saved state when user explicitly resets
    clearCurrentState();
  };

  const isSearchDisabled = !searchData.country || !searchData.studyLevel || !searchData.field;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-4">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Universities & Scholarships</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover top universities and scholarship opportunities worldwide to fund your academic journey.
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
        {apiError && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">Notice</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">{apiError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Three Section Search Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Country Selection with Dropdown */}
              <div className="relative" ref={countryDropdownRef}>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Select Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={handleCountrySearchChange}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="Type country name..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  {countrySearch && (
                    <button
                      onClick={clearCountry}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                
                {/* Country Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        No countries found
                      </div>
                    ) : (
                      filteredCountries.map(country => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          {country}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Study Level Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Study Level
                </label>
                <select
                  value={searchData.studyLevel}
                  onChange={(e) => handleSearchDataChange('studyLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="">Select level</option>
                  {studyLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Field of Study
                </label>
                <select
                  value={searchData.field}
                  onChange={(e) => handleSearchDataChange('field', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="">Choose a field</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={resetSearch}
                className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearchDisabled || isLoading}
                className="px-6 py-2 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 font-medium"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isLoading ? 'Searching...' : `Search ${activeTab === 'universities' ? 'Universities' : 'Scholarships'}`}
              </button>
            </div>
            
            {/* Search History Section */}
            {searchHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <History className="h-4 w-4" /> Recent Searches
                  </h3>
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => applyHistoryItem(item)}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-sm text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-800 transition-all"
                    >
                      <Clock className="h-3 w-3 text-gray-400 group-hover:text-violet-500" />
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{item.activeTab}:</span>
                      <span>{item.country}, {item.field}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Helper Text */}
            {isSearchDisabled && !apiError && (
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Please fill in country, study level, and field to search.
              </div>
            )}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('universities')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'universities'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-violet-500'
              }`}
            >
              Universities
            </button>
            <button
              onClick={() => handleTabChange('scholarships')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === 'scholarships'
                  ? 'bg-violet-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-violet-500'
              }`}
            >
              Scholarships
            </button>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="mb-6 space-y-4">
          {/* Quick Search by Country */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Search by Country:</h3>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => handleTagClick('country', country)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    searchData.country === country
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <Globe className="w-3 h-3 inline mr-1" />
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search by Subject */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Search by Subject:</h3>
            <div className="flex flex-wrap gap-2">
              {fields.filter(field => field !== 'all').map((field) => (
                <button
                  key={field}
                  onClick={() => handleTagClick('subject', field)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    searchData.field === field
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {field}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quick Search by Level */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level:</h3>
            <div className="flex flex-wrap gap-2">
              {studyLevels.filter(level => level !== 'all').map((level) => (
                <button
                  key={level}
                  onClick={() => handleTagClick('level', level)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    searchData.studyLevel === level
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Gemini AI Recommendations Section */}
        
        
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
          
          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <UniversityCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <SearchResults 
                isLoading={isLoading} 
                results={activeTab === 'universities' ? universities : scholarships} 
                emptyMessage={`No ${activeTab} match your search criteria. Try adjusting your filters or search query.`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTab === 'universities' 
                    ? universities.map((university, index) => (
                        <UniversityCard key={university.id || index} university={university} />
                      ))
                    : scholarships.map((scholarship, index) => (
                        <ScholarshipCard key={scholarship.id || index} scholarship={scholarship} />
                      ))
                  }
                </div>
              </SearchResults>
            )}

            {/* For You Section */}
            <div className='mt-20'>
              {showGeminiSection && !isLoading && (
          <div className="max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-5 sm:p-6 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-800/30 bg-gradient-to-r from-white to-indigo-50/30 dark:from-gray-800 dark:to-indigo-900/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-md">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Education Recommendations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gemini AI suggests these alternative universities for {searchData.field} in {searchData.country}
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
                    onClick={() => fetchGeminiRecommendations(searchData.country, searchData.studyLevel, searchData.field)}
                    disabled={isLoadingGemini}
                    className="text-sm bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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
              
              {/* Gemini Error Message */}
              {geminiError && (
                <div className="mb-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">AI Service Notice</p>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">{geminiError}. Showing fallback recommendations.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoadingGemini ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
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
                  {geminiRecommendations.map((recommendation, index) => (
                    <GeminiUniversityCard key={`gemini-uni-${index}`} recommendation={recommendation} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                    <Brain className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No AI Recommendations Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Perform a university search with a specific field of study to get AI-powered education recommendations.
                  </p>
                </div>
              )}
              
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Note:</span> These are AI-generated suggestions based on your search for {searchData.field} programs in {searchData.country}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-500 dark:text-gray-400">High scholarship availability</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-500 dark:text-gray-400">Medium scholarship availability</span>
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
      </div>
    </div>
  );
};

export default UniversitySearch;
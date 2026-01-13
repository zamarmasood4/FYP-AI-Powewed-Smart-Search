import React, { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import JobCard from '../components/JobCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import ForYouSection from '../components/ForYouSection';
import { Briefcase, Search, MapPin, Globe, Loader2, ChevronDown, X, AlertCircle, History, Clock, Trash2, Sparkles, ArrowRight, Brain, DollarSign, Calendar, TrendingUp, ExternalLink } from 'lucide-react';

// Import the packages
import countries from 'world-countries';
import axios from 'axios';

// --- (Existing Cities Data & Helper Functions remain exactly the same) ---
const enhancedCities = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington'],
  GB: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow', 'Edinburgh', 'Leeds', 'Bristol', 'Sheffield', 'Newcastle', 'Cardiff', 'Belfast'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Hamilton', 'Halifax'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  FR: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  IN: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'],
  CN: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Tianjin', 'Nanjing'],
  JP: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Hiroshima'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife'],
  IT: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Malaga', 'Murcia', 'Palma', 'Las Palmas'],
  NL: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg', 'Almere', 'Breda'],
  SG: ['Singapore'],
  KR: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon'],
  MX: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Toluca', 'Tijuana', 'León', 'Ciudad Juárez', 'Torreón'],
  ZA: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London'],
  AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah'],
  TR: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Adana', 'Gaziantep', 'Konya', 'Antalya'],
  SE: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping'],
  NO: ['Oslo', 'Bergen', 'Stavanger', 'Trondheim', 'Drammen', 'Fredrikstad', 'Kristiansand'],
  DK: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding']
};

const getCountryNameFromCode = (countryCode) => {
  const country = countries.find(c => c.cca2 === countryCode);
  return country ? country.name.common : '';
};

const getCitiesForCountry = async (countryCode) => {
  try {
    const countryName = getCountryNameFromCode(countryCode);
    if (!countryName) throw new Error('Country name not found');

    const response = await axios.post('https://countriesnow.space/api/v0.1/countries/cities', {
      country: countryName
    });

    if (response.data && response.data.data) {
      return response.data.data.sort();
    } else {
      throw new Error('No cities data received from API');
    }
  } catch (error) {
    console.warn(`API failed for ${countryCode}, using fallback data:`, error.message);
    if (enhancedCities[countryCode]) return enhancedCities[countryCode];
    return ['Capital City', 'Major City 1', 'Major City 2', 'Major City 3', 'Major City 4'];
  }
};

const generateCompanyLogo = (companyName) => {
  const cleanName = companyName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const initials = cleanName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'];
  const colorIndex = cleanName.length % colors.length;
  
  return (
    <div className={`w-12 h-12 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
      {initials}
    </div>
  );
};

// Cache management
const jobCache = new Map();
const CACHE_KEY = 'jobSearchCache';
const CURRENT_JOBS_KEY = 'currentJobsData';
const HISTORY_KEY = 'jobSearchHistory';

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyDAqOzI2Sx55tWXiYr7URw7I4uLYl_t2nU";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

// Cache keys for Gemini
const GEMINI_CACHE_KEY = 'geminiJobCache';
const RECOMMENDED_JOBS_KEY = 'recommendedJobs';
const GEMINI_RECOMMENDATIONS_KEY = 'geminiRecommendations';

// Load cache from localStorage on initial load
const loadCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      parsedCache.forEach(([key, value]) => jobCache.set(key, value));
    }
  } catch (error) {
    console.warn('Failed to load cache from storage:', error);
  }
};

const saveCacheToStorage = () => {
  try {
    const cacheArray = Array.from(jobCache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArray));
  } catch (error) {
    console.warn('Failed to save cache to storage:', error);
  }
};

const saveCurrentState = (jobs, searchQuery, filters, countrySearch, citySearch) => {
  try {
    const currentState = { jobs, searchQuery, filters, countrySearch, citySearch, timestamp: Date.now() };
    localStorage.setItem(CURRENT_JOBS_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.warn('Failed to save current state:', error);
  }
};

const loadCurrentState = () => {
  try {
    const saved = localStorage.getItem(CURRENT_JOBS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.warn('Failed to load current state:', error);
  }
  return null;
};

const clearCurrentState = () => {
  try {
    localStorage.removeItem(CURRENT_JOBS_KEY);
  } catch (error) {
    console.warn('Failed to clear current state:', error);
  }
};

// Generate cache key including user_id
const generateCacheKey = (searchData, userId) => {
  return `${userId || 'guest'}-${searchData.title}-${searchData.country}-${searchData.city}`.toLowerCase();
};

// Function to get user_id from JWT token
const getUserIdFromToken = () => {
  try {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      console.log('No access token found');
      return null;
    }
    
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token format');
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
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

// Function to generate search URL for a job
const generateJobSearchUrl = (jobTitle, location, company = '') => {
  const query = encodeURIComponent(`${jobTitle} ${company} ${location}`);
  return `https://www.google.com/search?q=${query}+jobs&ibp=htl;jobs`;
};

// Function to generate LinkedIn search URL
const generateLinkedInJobUrl = (jobTitle, location) => {
  const query = encodeURIComponent(`${jobTitle} ${location}`);
  return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
};

// Function to generate Indeed search URL
const generateIndeedJobUrl = (jobTitle, location) => {
  const query = encodeURIComponent(`${jobTitle} ${location}`);
  return `https://www.indeed.com/jobs?q=${query}&l=${encodeURIComponent(location)}`;
};

// Gemini API Function to search for jobs - Enhanced with actual job links
const searchJobsWithGemini = async (searchQuery, country, city, userId) => {
  try {
    const cacheKey = `gemini-${userId || 'guest'}-${searchQuery}-${country}-${city}`.toLowerCase();
    
    // Check cache first
    const cachedGeminiData = localStorage.getItem(GEMINI_CACHE_KEY);
    if (cachedGeminiData) {
      const parsedCache = JSON.parse(cachedGeminiData);
      if (parsedCache[cacheKey]) {
        const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours cache
          console.log('Returning cached Gemini results');
          return parsedCache[cacheKey].jobs;
        }
      }
    }
    
    console.log('Fetching job recommendations from Gemini...');
    
    // Construct the prompt for Gemini
    const prompt = `You are a career advisor and job search expert. Based on the following job search criteria:
    
    Job Title: "${searchQuery}"
    Location: "${city}, ${country}"
    
    Please provide 6-8 additional job title recommendations that:
    1. Are related to the search query but offer different career paths
    2. Are in high demand in ${city}, ${country}
    3. Include emerging roles in the field
    4. Have good career growth potential
    5. Include realistic companies that hire for these roles
    
    For each recommendation, provide:
    - Job Title (make it specific and realistic)
    - Brief description (1 sentence)
    - Key skills required (3-4 skills)
    - Average salary range (in local currency, be realistic)
    - Why it's a good alternative (1 sentence)
    - Job Type (Full-time/Remote/Hybrid/Contract)
    - Experience Level (Entry-level/Mid-level/Senior)
    - Typical companies hiring (provide 2-3 real company names)
    - Location: "${city}, ${country}"
    
    Format the response as a JSON array of objects with these exact fields:
    [
      {
        "title": "Specific Job Title",
        "description": "Brief description",
        "skills": ["skill1", "skill2", "skill3"],
        "salary": "Realistic salary range like $80,000 - $120,000",
        "whyGood": "Why it's a good alternative",
        "type": "Full-time/Remote/Hybrid/Contract",
        "experience": "Entry-level/Mid-level/Senior",
        "company": "Real Company 1, Real Company 2",
        "location": "${city}, ${country}",
        "growth": "High/Medium/Low demand"
      }
    ]
    
    Make the recommendations diverse, practical, and realistic. Use real company names when possible.`;

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
    let geminiJobs = [];
    
    if (jsonMatch) {
      try {
        geminiJobs = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Failed to parse Gemini JSON response:', error);
        // Fallback: Create structured data from text
        geminiJobs = createFallbackJobs(searchQuery, country, city);
      }
    } else {
      // Fallback if no JSON found
      geminiJobs = createFallbackJobs(searchQuery, country, city);
    }
    
    // Add Gemini-specific metadata and generate job links
    const enhancedJobs = geminiJobs.map((job, index) => {
      // Generate multiple job search links
      const googleUrl = generateJobSearchUrl(job.title, job.location, job.company);
      const linkedinUrl = generateLinkedInJobUrl(job.title, job.location);
      const indeedUrl = generateIndeedJobUrl(job.title, job.location);
      
      return {
        id: `gemini-${Date.now()}-${index}`,
        title: job.title || `${searchQuery} Specialist`,
        description: job.description || `AI-recommended ${searchQuery} role in ${city}`,
        company: job.company || 'Various Companies',
        companyName: job.company || 'AI Recommended',
        location: job.location || `${city}, ${country}`,
        salary: job.salary || 'Competitive salary',
        jobType: job.type || 'Full-time',
        experience: job.experience || '2-5 years',
        posted: 'AI Recommended',
        skills: job.skills || ['Adaptability', 'Problem Solving', 'Communication'],
        whyGood: job.whyGood || 'Growing demand in this location',
        growth: job.growth || 'High demand',
        isGeminiRecommended: true,
        source: 'gemini-ai',
        // Add job search links
        jobLinks: {
          google: googleUrl,
          linkedin: linkedinUrl,
          indeed: indeedUrl
        },
        // Set primary link (Google search as default)
        primaryLink: googleUrl
      };
    });
    
    // Cache the results
    const cachedData = JSON.parse(localStorage.getItem(GEMINI_CACHE_KEY) || '{}');
    cachedData[cacheKey] = {
      jobs: enhancedJobs,
      timestamp: Date.now(),
      query: { searchQuery, country, city }
    };
    localStorage.setItem(GEMINI_CACHE_KEY, JSON.stringify(cachedData));
    
    return enhancedJobs;
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    // Return fallback recommendations with job links
    return createFallbackJobs(searchQuery, country, city);
  }
};

// Fallback function if Gemini fails - Enhanced with job links
const createFallbackJobs = (searchQuery, country, city) => {
  const baseTitles = [
    `${searchQuery} Manager`,
    `Senior ${searchQuery}`,
    `${searchQuery} Analyst`,
    `${searchQuery} Consultant`,
    `Lead ${searchQuery}`,
    `${searchQuery} Developer`,
    `${searchQuery} Specialist`,
    `${searchQuery} Coordinator`
  ];
  
  const companies = [
    'Google, Microsoft, Amazon',
    'Apple, Facebook, Netflix',
    'IBM, Oracle, SAP',
    'Salesforce, Adobe, Intuit',
    'Tesla, SpaceX, Boeing',
    'Uber, Lyft, DoorDash',
    'Airbnb, Booking.com, Expedia',
    'Spotify, Netflix, Disney'
  ];
  
  return baseTitles.map((title, index) => {
    const googleUrl = generateJobSearchUrl(title, `${city}, ${country}`, companies[index]);
    const linkedinUrl = generateLinkedInJobUrl(title, `${city}, ${country}`);
    const indeedUrl = generateIndeedJobUrl(title, `${city}, ${country}`);
    
    return {
      id: `fallback-${Date.now()}-${index}`,
      title,
      description: `AI-recommended position based on your search for ${searchQuery}`,
      company: companies[index],
      companyName: 'AI Recommended',
      location: `${city}, ${country}`,
      salary: '$80,000 - $120,000',
      jobType: ['Full-time', 'Remote', 'Hybrid', 'Contract'][index % 4],
      experience: ['Entry-level', 'Mid-level', 'Senior', 'Mid-level'][index % 4],
      posted: 'AI Recommended',
      skills: ['Communication', 'Problem Solving', 'Teamwork', 'Technical Skills'],
      whyGood: 'High demand role with good growth potential',
      growth: ['High', 'Medium', 'High', 'Medium'][index % 4],
      isGeminiRecommended: true,
      source: 'gemini-fallback',
      jobLinks: {
        google: googleUrl,
        linkedin: linkedinUrl,
        indeed: indeedUrl
      },
      primaryLink: googleUrl
    };
  });
};

// Function to fetch recommended jobs based on history
const fetchRecommendedJobs = async (history) => {
  if (!history || history.length === 0) {
    console.log('No history found for recommendations');
    return [];
  }

  try {
    // Get the most recent search from history
    const mostRecentSearch = history[0];
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const requestBody = {
      query: mostRecentSearch.query,
      country: mostRecentSearch.countryCode.toLowerCase(),
      city: mostRecentSearch.city.toLowerCase(),
      page: 1,
      limit: 4
    };
    
    const userId = getUserIdFromToken();
    if (userId) {
      requestBody.userId = userId;
    }
    
    console.log('Fetching recommended jobs based on:', mostRecentSearch);
    
    const response = await fetch(`${API_BASE_URL}/api/search/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const recommendedJobs = (data.results || []).slice(0, 4).map(job => ({
        ...job,
        location: job.location && job.location.trim() !== '' 
          ? job.location 
          : `${mostRecentSearch.city}, ${getCountryNameFromCode(mostRecentSearch.countryCode) || mostRecentSearch.countryCode}`,
        companyName: job.company?.split('\n')[0] || job.company || 'Company',
        salary: job.salary || 'Salary not specified',
        jobType: job.jobType || 'Not specified',
        experience: job.experience || 'Not specified',
        posted: job.posted || 'Recent',
        isRecommended: true
      }));
      
      // Save recommended jobs to localStorage
      localStorage.setItem(RECOMMENDED_JOBS_KEY, JSON.stringify({
        jobs: recommendedJobs,
        timestamp: Date.now(),
        basedOn: mostRecentSearch
      }));
      
      return recommendedJobs;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
};

// Function to load recommended jobs from cache
const loadRecommendedJobsFromCache = () => {
  try {
    const cached = localStorage.getItem(RECOMMENDED_JOBS_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      const isDataFresh = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
      if (isDataFresh) {
        return data.jobs;
      }
    }
  } catch (error) {
    console.warn('Failed to load recommended jobs from cache:', error);
  }
  return null;
};

// Function to load Gemini recommendations from cache
const loadGeminiRecommendationsFromCache = (searchQuery, country, city) => {
  try {
    const cachedData = localStorage.getItem(GEMINI_CACHE_KEY);
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      const cacheKey = `gemini-guest-${searchQuery}-${country}-${city}`.toLowerCase();
      
      if (parsedCache[cacheKey]) {
        const cacheAge = Date.now() - parsedCache[cacheKey].timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return parsedCache[cacheKey].jobs;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load Gemini recommendations from cache:', error);
  }
  return null;
};

// fetchJobs function with user_id
const fetchJobs = async (searchData, userId) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const cacheKey = generateCacheKey(searchData, userId);
    
    if (jobCache.has(cacheKey)) {
      console.log('Returning cached results for:', cacheKey);
      return jobCache.get(cacheKey);
    }
    
    const requestBody = {
      query: searchData.title,
      country: searchData.country.toLowerCase(),
      city: searchData.city.toLowerCase(),
      page: 1
    };
    
    if (userId) {
      requestBody.userId = userId;
      console.log('Sending request with userId:', userId);
    } else {
      console.log('No userId available, sending request without it');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/search/jobs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('API endpoint not found. Please check the server.');
      else if (response.status === 500) throw new Error('Server error. Please try again later.');
      else if (response.status === 429) throw new Error('Too many requests. Please wait and try again.');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const processedJobs = (data.results || []).map(job => ({
        ...job,
        location: job.location && job.location.trim() !== '' 
          ? job.location 
          : `${searchData.city}, ${getCountryNameFromCode(searchData.country) || searchData.country}`,
        companyName: job.company?.split('\n')[0] || job.company || 'Company',
        salary: job.salary || 'Salary not specified',
        jobType: job.jobType || 'Not specified',
        experience: job.experience || 'Not specified',
        posted: job.posted || 'Recent'
      }));
      
      jobCache.set(cacheKey, processedJobs);
      saveCacheToStorage();
      return processedJobs;
    } else {
      throw new Error('API returned unsuccessful response');
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// New Component: GeminiJobCard - Minimal and structured
const GeminiJobCard = ({ job, index }) => {
  const [showMoreLinks, setShowMoreLinks] = useState(false);
  
  const handleCardClick = (e) => {
    // Only open link if not clicking on the "More options" button
    if (!e.target.closest('.more-options-btn')) {
      window.open(job.primaryLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleLinkClick = (url, e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 hover:shadow-lg group cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Card Header with Gradient */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Brain className="h-3 w-3 mr-1" />
                AI Recommended
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {job.jobType}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1 text-lg">
              {job.title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreLinks(!showMoreLinks);
            }}
            className="more-options-btn p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="More job search options"
          >
            <ExternalLink className="h-4 w-4 text-gray-400 hover:text-purple-500" />
          </button>
        </div>
        
        {/* Company and Location */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
              {job.company.split(',')[0]}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
              <DollarSign className="h-3 w-3" />
              <span>{job.salary}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="px-5 py-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        {/* Why Good Section */}
        <div className="flex items-start gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
          <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
            <span className="font-medium">Why consider:</span> {job.whyGood}
          </p>
        </div>
        
        {/* Skills Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 3).map((skill, skillIndex) => (
              <span 
                key={skillIndex} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Experience and Growth */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{job.experience}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            job.growth === 'High' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : job.growth === 'Medium'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
          }`}>
            {job.growth} demand
          </div>
        </div>
      </div>
      
      {/* Job Links Dropdown */}
      {showMoreLinks && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 animate-in slide-in-from-top duration-200">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Search this job on:</p>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => handleLinkClick(job.jobLinks.google, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">G</span>
              </div>
              <span className="flex-1 text-left">Google Jobs</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            
            <button
              onClick={(e) => handleLinkClick(job.jobLinks.linkedin, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">in</span>
              </div>
              <span className="flex-1 text-left">LinkedIn</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            
            <button
              onClick={(e) => handleLinkClick(job.jobLinks.indeed, e)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
            >
              <div className="w-4 h-4 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">I</span>
              </div>
              <span className="flex-1 text-left">Indeed</span>
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
            window.open(job.primaryLink, '_blank', 'noopener,noreferrer');
          }}
          className="w-full py-2.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
        >
          Search Jobs
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ country: '', city: '' });
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [allCountries, setAllCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [error, setError] = useState('');
  
  // User ID and Authentication State
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Recommended Jobs State
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Gemini Recommendations State
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [showGeminiSection, setShowGeminiSection] = useState(false);
  
  const countryDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    loadCacheFromStorage();
    
    const savedState = loadCurrentState();
    if (savedState) {
      setJobs(savedState.jobs || []);
      setSearchQuery(savedState.searchQuery || '');
      setFilters(savedState.filters || { country: '', city: '' });
      setCountrySearch(savedState.countrySearch || '');
      setCitySearch(savedState.citySearch || '');
      
      if (savedState.filters?.country) {
        loadCitiesForCountry(savedState.filters.country);
      }
    }

    // Load History
    const history = localStorage.getItem(HISTORY_KEY);
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        setSearchHistory(parsedHistory);
        
        // Load recommended jobs based on history
        loadRecommendedJobs(parsedHistory);
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

    return () => {
      saveCacheToStorage();
    };
  }, []);

  // Function to load recommended jobs
  const loadRecommendedJobs = async (history) => {
    if (!history || history.length === 0) return;
    
    setIsLoadingRecommendations(true);
    
    // Try to load from cache first
    const cachedRecommendations = loadRecommendedJobsFromCache();
    if (cachedRecommendations) {
      setRecommendedJobs(cachedRecommendations);
      setIsLoadingRecommendations(false);
      return;
    }
    
    // Fetch fresh recommendations
    const recommendations = await fetchRecommendedJobs(history);
    setRecommendedJobs(recommendations);
    setIsLoadingRecommendations(false);
  };

  // Function to fetch Gemini recommendations
  const fetchGeminiRecommendations = async (query, country, city) => {
    if (!query || !country || !city) return;
    
    setIsLoadingGemini(true);
    setShowGeminiSection(true);
    
    // Check cache first
    const cachedRecommendations = loadGeminiRecommendationsFromCache(query, country, city);
    if (cachedRecommendations) {
      setGeminiRecommendations(cachedRecommendations);
      setIsLoadingGemini(false);
      return;
    }
    
    try {
      const userId = getUserIdFromToken();
      const recommendations = await searchJobsWithGemini(query, country, city, userId);
      setGeminiRecommendations(recommendations);
      
      // Also cache these as general recommendations
      localStorage.setItem(GEMINI_RECOMMENDATIONS_KEY, JSON.stringify({
        jobs: recommendations,
        timestamp: Date.now(),
        query: { query, country, city }
      }));
      
    } catch (error) {
      console.error('Failed to fetch Gemini recommendations:', error);
      setGeminiRecommendations([]);
    } finally {
      setIsLoadingGemini(false);
    }
  };

  useEffect(() => {
    if (jobs.length > 0 || searchQuery || filters.country || filters.city) {
      saveCurrentState(jobs, searchQuery, filters, countrySearch, citySearch);
    }
  }, [jobs, searchQuery, filters, countrySearch, citySearch]);

  useEffect(() => {
    const formattedCountries = countries
      .map(country => ({
        cca2: country.cca2,
        name: country.name.common,
        flag: country.flag
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setAllCountries(formattedCountries);
  }, []);

  // Add to History Function
  const addToHistory = (query, countryCode, countryName, city) => {
    const newEntry = { query, countryCode, countryName, city, timestamp: Date.now() };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.query.toLowerCase() === query.toLowerCase() && 
          item.countryCode === countryCode && 
          item.city.toLowerCase() === city.toLowerCase())
      );
      
      const updated = [newEntry, ...filtered].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Refresh recommendations when history is updated
    loadRecommendedJobs([newEntry, ...searchHistory].slice(0, 5));
    
    // Fetch Gemini recommendations for this search
    fetchGeminiRecommendations(query, countryName, city);
  };

  // Clear History Function
  const clearHistory = () => {
    setSearchHistory([]);
    setRecommendedJobs([]);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(RECOMMENDED_JOBS_KEY);
    localStorage.removeItem(GEMINI_RECOMMENDATIONS_KEY);
  };

  // Apply History Function
  const applyHistoryItem = async (item) => {
    // 1. Set State
    setSearchQuery(item.query);
    setCountrySearch(item.countryName);
    setCitySearch(item.city);
    setFilters({ country: item.countryCode, city: item.city });
    
    // 2. Load cities (for dropdown functionality)
    await loadCitiesForCountry(item.countryCode);
    
    // 3. Trigger Search
    await loadJobs(item.query, { country: item.countryCode, city: item.city });
    
    // 4. Fetch Gemini recommendations
    fetchGeminiRecommendations(item.query, item.countryName, item.city);
  };

  const loadCitiesForCountry = async (countryCode) => {
    setIsLoadingCities(true);
    try {
      const cities = await getCitiesForCountry(countryCode);
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error loading cities:', error);
      setAvailableCities(['Capital City', 'Major City 1', 'Major City 2']);
    } finally {
      setIsLoadingCities(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = allCountries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    setError('');
  };
  
  const handleCountrySelect = async (countryCode, countryName) => {
    setFilters(prev => ({ ...prev, country: countryCode, city: '' }));
    setCountrySearch(countryName);
    setShowCountryDropdown(false);
    setCitySearch('');
    setError('');
    await loadCitiesForCountry(countryCode);
  };

  const handleCitySelect = (city) => {
    setFilters(prev => ({ ...prev, city }));
    setCitySearch(city);
    setShowCityDropdown(false);
    setError('');
  };

  const handleCountrySearchChange = (e) => {
    setCountrySearch(e.target.value);
    setShowCountryDropdown(true);
    setFilters(prev => ({ ...prev, country: '', city: '' }));
    setCitySearch('');
    setAvailableCities([]);
    setError('');
  };

  const handleCitySearchChange = (e) => {
    setCitySearch(e.target.value);
    setShowCityDropdown(true);
    setFilters(prev => ({ ...prev, city: '' }));
    setError('');
  };

  const clearCountry = () => {
    setCountrySearch('');
    setFilters(prev => ({ ...prev, country: '', city: '' }));
    setCitySearch('');
    setAvailableCities([]);
    setShowCountryDropdown(false);
    setError('');
  };

  const clearCity = () => {
    setCitySearch('');
    setFilters(prev => ({ ...prev, city: '' }));
    setShowCityDropdown(false);
    setError('');
  };

  const searchJobs = async () => {
    if (!searchQuery || !filters.country || !filters.city) {
      setError('Please fill in job title, country, and city to search for jobs.');
      return;
    }
    
    setError('');
    
    // Add to local history (frontend only) before searching
    addToHistory(searchQuery, filters.country, countrySearch, filters.city);
    
    await loadJobs(searchQuery, filters);
  };
  
  const resetSearch = () => {
    setSearchQuery('');
    setFilters({ country: '', city: '' });
    setCountrySearch('');
    setCitySearch('');
    setAvailableCities([]);
    setJobs([]);
    setGeminiRecommendations([]);
    setShowGeminiSection(false);
    setError('');
    setShowCountryDropdown(false);
    setShowCityDropdown(false);
    clearCurrentState();
  };
  
  const loadJobs = async (query, jobFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const searchFilters = { title: query, ...jobFilters };
      const response = await fetchJobs(searchFilters, userId);
      setJobs(response);
      
      // Fetch Gemini recommendations after successful search
      if (response.length > 0) {
        const countryName = getCountryNameFromCode(jobFilters.country) || jobFilters.country;
        fetchGeminiRecommendations(query, countryName, jobFilters.city);
      }
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSearchDisabled = !searchQuery || !filters.country || !filters.city;

  // Function to apply recommended job search
  const applyRecommendedSearch = (job) => {
    // Extract query from job title or description
    const query = job.title.split(' ').slice(0, 3).join(' ');
    
    // Extract location from job location
    const locationParts = job.location.split(',');
    const city = locationParts[0]?.trim() || '';
    const country = locationParts[1]?.trim() || '';
    
    // Find country code from country name
    const countryObj = allCountries.find(c => 
      c.name.toLowerCase().includes(country.toLowerCase())
    );
    
    if (countryObj) {
      setSearchQuery(query);
      setCountrySearch(countryObj.name);
      setCitySearch(city);
      setFilters({ country: countryObj.cca2, city });
      loadCitiesForCountry(countryObj.cca2);
      
      // Trigger search
      setTimeout(() => {
        searchJobs();
      }, 100);
    } else {
      setSearchQuery(query);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Find Your Dream Job</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search for jobs by title, country, and city. Fill in all fields to find the perfect opportunity.
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
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Explore More Section (if no history) */}
        {searchHistory.length === 0 && !isLoading && (
          <div className="max-w-4xl mx-auto mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-6 sm:p-8 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Start Your Job Search Journey</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                Search for jobs to get personalized recommendations powered by AI.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('Software Engineer');
                    setCountrySearch('United States');
                    setCitySearch('San Francisco');
                    const usCountry = allCountries.find(c => c.cca2 === 'US');
                    if (usCountry) {
                      setFilters({ country: 'US', city: 'San Francisco' });
                      loadCitiesForCountry('US');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Software Engineer in US
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('Marketing Manager');
                    setCountrySearch('United Kingdom');
                    setCitySearch('London');
                    const ukCountry = allCountries.find(c => c.cca2 === 'GB');
                    if (ukCountry) {
                      setFilters({ country: 'GB', city: 'London' });
                      loadCitiesForCountry('GB');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Marketing Manager in UK
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('Data Analyst');
                    setCountrySearch('Canada');
                    setCitySearch('Toronto');
                    const caCountry = allCountries.find(c => c.cca2 === 'CA');
                    if (caCountry) {
                      setFilters({ country: 'CA', city: 'Toronto' });
                      loadCitiesForCountry('CA');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Data Analyst in Canada
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-5 sm:p-6 rounded-xl shadow-lg scale-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Job Title Search */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Job Title</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Country Search */}
              <div className="relative" ref={countryDropdownRef}>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={handleCountrySearchChange}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="Type country name..."
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {countrySearch && (
                    <button onClick={clearCountry} className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                
                {showCountryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCountries.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No countries found</div>
                    ) : (
                      filteredCountries.map(country => (
                        <button
                          key={country.cca2}
                          type="button"
                          onClick={() => handleCountrySelect(country.cca2, country.name)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* City Search */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  {isLoadingCities && <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />}
                  <input
                    type="text"
                    value={citySearch}
                    onChange={handleCitySearchChange}
                    onFocus={() => filters.country && setShowCityDropdown(true)}
                    disabled={!filters.country || isLoadingCities}
                    placeholder={isLoadingCities ? 'Loading...' : !filters.country ? 'Select country first' : 'Type city name...'}
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:dark:bg-gray-900 disabled:cursor-not-allowed"
                  />
                  {citySearch && !isLoadingCities && (
                    <button onClick={clearCity} className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                
                {showCityDropdown && filters.country && !isLoadingCities && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCities.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No cities found for "{citySearch}"</div>
                    ) : (
                      filteredCities.map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          {city}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button onClick={resetSearch} className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Reset
              </button>
              <button
                onClick={searchJobs}
                disabled={isSearchDisabled || isLoading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-md flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isLoading ? 'Searching...' : 'Search Jobs'}
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
                      className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm text-gray-700 dark:text-gray-300 rounded-full border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                    >
                      <Clock className="h-3 w-3 text-gray-400 group-hover:text-blue-500" />
                      <span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.query}</span>
                        <span className="text-gray-500 dark:text-gray-400"> in </span>
                        <span>{item.city}, {item.countryName}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isSearchDisabled && !error && (
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Please fill in job title, country, and city to search for jobs.
              </div>
            )}
          </div>
        </div>
        
        {/* Job Results */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <SearchResults 
              isLoading={isLoading} 
              results={jobs} 
              emptyMessage={
                jobs.length === 0 && !error
                  ? "Fill in the search criteria above to find jobs." 
                  : "No jobs match your search criteria. Try adjusting your search terms."
              }
            >
              <div className="space-y-6">
                {jobs.map((job, index) => (
                  <JobCard key={job.id || index} job={job} />
                ))}
              </div>
            </SearchResults>
          )}
        </div>
        
        {/* Gemini AI Recommendations Section - UPDATED */}
        {showGeminiSection && !isLoading && (
          <div className="max-w-7xl mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-5 sm:p-6 rounded-xl shadow-lg border border-purple-100 dark:border-purple-800/30 bg-gradient-to-r from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Career Recommendations</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Gemini AI suggests these opportunities in {filters.city || 'your area'}
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
                    onClick={() => fetchGeminiRecommendations(searchQuery, countrySearch, filters.city)}
                    disabled={isLoadingGemini}
                    className="text-sm bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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
                  {geminiRecommendations.slice(0, 6).map((job, index) => (
                    <GeminiJobCard key={`gemini-${index}`} job={job} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                    <Brain className="h-6 w-6 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No AI Recommendations Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Perform a job search to get AI-powered career recommendations tailored to your criteria.
                  </p>
                </div>
              )}
              
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Note:</span> These are AI-generated suggestions based on your search for "{searchQuery}" in {filters.city || 'selected location'}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-500 dark:text-gray-400">High demand</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-500 dark:text-gray-400">Medium demand</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
       
      </div>
    </div>
  );
};

export default JobSearch;
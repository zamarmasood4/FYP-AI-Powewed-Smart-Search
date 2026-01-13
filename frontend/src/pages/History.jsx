import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Briefcase, 
  GraduationCap, 
  ShoppingBag, 
  Loader2,
  AlertCircle,
  LogIn,
  RotateCcw,
  RefreshCw,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';

// Import your card components
import JobCard from '../components/JobCard';
import ScholarshipCard from '../components/ScholarshipCard';
import UniversityCard from '../components/UniversityCard';
import ProductCard from '../components/ProductCard';

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

const History = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  
  // State for actual user history data
  const [userJobs, setUserJobs] = useState([]);
  const [userScholarships, setUserScholarships] = useState([]);
  const [userUniversities, setUserUniversities] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Storage keys for localStorage
  const STORAGE_KEYS = {
    JOBS: 'user_jobs_history',
    SCHOLARSHIPS: 'user_scholarships_history',
    UNIVERSITIES: 'user_universities_history',
    PRODUCTS: 'user_products_history',
    LAST_FETCHED: 'history_last_fetched',
    USER_ID: 'history_user_id',
    CACHE_DURATION: 5 * 60 * 1000,
  };

  // Get session token from localStorage
  const getSessionToken = () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      return accessToken;
    } catch (error) {
      console.error('Error getting session token:', error);
      return null;
    }
  };

  // Load cached data from localStorage
  const loadCachedData = () => {
    try {
      const lastFetched = localStorage.getItem(STORAGE_KEYS.LAST_FETCHED);
      const cachedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      const currentUserId = userId;
      const now = Date.now();
      
      if (lastFetched && 
          cachedUserId === currentUserId && 
          (now - parseInt(lastFetched)) < STORAGE_KEYS.CACHE_DURATION) {
        
        const cachedJobs = localStorage.getItem(STORAGE_KEYS.JOBS);
        const cachedScholarships = localStorage.getItem(STORAGE_KEYS.SCHOLARSHIPS);
        const cachedUniversities = localStorage.getItem(STORAGE_KEYS.UNIVERSITIES);
        const cachedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        
        if (cachedJobs) {
          setUserJobs(JSON.parse(cachedJobs));
        }
        if (cachedScholarships) {
          setUserScholarships(JSON.parse(cachedScholarships));
        }
        if (cachedUniversities) {
          setUserUniversities(JSON.parse(cachedUniversities));
        }
        if (cachedProducts) {
          setUserProducts(JSON.parse(cachedProducts));
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
    return false;
  };

  // Save data to localStorage
  const saveToLocalStorage = (type, data) => {
    try {
      switch (type) {
        case 'jobs':
          localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(data));
          break;
        case 'scholarships':
          localStorage.setItem(STORAGE_KEYS.SCHOLARSHIPS, JSON.stringify(data));
          break;
        case 'universities':
          localStorage.setItem(STORAGE_KEYS.UNIVERSITIES, JSON.stringify(data));
          break;
        case 'products':
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          break;
      }
      
      if (userId) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      }
      
      localStorage.setItem(STORAGE_KEYS.LAST_FETCHED, Date.now().toString());
    } catch (error) {
      console.error(`Error saving ${type} to localStorage:`, error);
    }
  };

  // Clear all cached history
  const clearCache = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.JOBS);
      localStorage.removeItem(STORAGE_KEYS.SCHOLARSHIPS);
      localStorage.removeItem(STORAGE_KEYS.UNIVERSITIES);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCHED);
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Check authentication and load data on component mount
  useEffect(() => {
    const initializeHistory = async () => {
      const token = getSessionToken();
      if (!token) {
        setIsAuthenticated(false);
        setError('Please log in to view your history.');
        setIsLoading(false);
        return;
      }
      
      const extractedUserId = getUserIdFromToken();
      if (!extractedUserId) {
        setIsAuthenticated(false);
        setError('Unable to identify user. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      setUserId(extractedUserId);
      setIsAuthenticated(true);
      
      const cacheLoaded = loadCachedData();
      await fetchAllHistoryData();
      
      setIsLoading(false);
    };

    initializeHistory();
  }, []);

  // Fetch all history data at once
  const fetchAllHistoryData = async () => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const endpoints = [
        { 
          type: 'jobs', 
          url: `${API_BASE_URL}/api/search/jobs/job_history`,
          method: 'GET'
        },
        { 
          type: 'scholarships', 
          url: `${API_BASE_URL}/api/search/scholarships/scholarships_history`,
          method: 'GET'
        },
        { 
          type: 'universities', 
          url: `${API_BASE_URL}/api/search/universities/university_history`,
          method: 'GET'
        },
        { 
          type: 'products', 
          url: `${API_BASE_URL}/api/search/products/product_history`,
          method: 'GET'
        },
      ];

      const promises = endpoints.map(async ({ type, url, method }) => {
        try {
          const requestOptions = {
            method: method,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          };
          
          const response = await fetch(url, requestOptions);
          
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Session expired');
            }
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            const transformedData = transformHistoryData(data.data || [], type);
            
            switch (type) {
              case 'jobs':
                setUserJobs(transformedData);
                break;
              case 'scholarships':
                setUserScholarships(transformedData);
                break;
              case 'universities':
                setUserUniversities(transformedData);
                break;
              case 'products':
                setUserProducts(transformedData);
                break;
            }
            
            saveToLocalStorage(type, transformedData);
            
            return { type, success: true, data: transformedData };
          } else {
            return { type, success: false, error: 'No data found' };
          }
        } catch (error) {
          console.error(`Error fetching ${type}:`, error);
          return { type, success: false, error: error.message };
        }
      });

      const results = await Promise.all(promises);
      
    } catch (error) {
      console.error('Error fetching all history:', error);
      if (error.message.includes('Session expired')) {
        setIsAuthenticated(false);
        setError('Session expired. Please log in again.');
      }
    }
  };

  // Refresh all history data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    clearCache();
    await fetchAllHistoryData();
    
    setIsRefreshing(false);
  };

  // Transform API data to match card component expectations
  const transformHistoryData = (data, type) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    switch (type) {
      case 'jobs':
        return data.map(job => ({
          id: job.id,
          title: job.title,
          company: `${job.company}\n${job.location}\n${job.job_type || 'Full-time'}`,
          companyName: job.company,
          location: job.location,
          salary: job.salary,
          experience: job.experience,
          description: job.description,
          posted: formatTimeAgo(job.created_at),
          url: job.url,
          type: job.job_type || 'Full-time',
          source: job.source,
          query: job.query
        }));
      
      case 'scholarships':
        return data.map(scholarship => ({
          id: scholarship.id,
          title: scholarship.scholarship_title,
          location: scholarship.location || scholarship.country,
          amount: scholarship.amount,
          sponsor: scholarship.sponsor,
          deadline: scholarship.deadline,
          studyLevel: scholarship.study_level,
          url: scholarship.url,
          description: scholarship.description,
          image: scholarship.image,
          field: scholarship.field || (Array.isArray(scholarship.fields) ? scholarship.fields.join(', ') : ''),
          programs: scholarship.programs || []
        }));
      
      case 'universities':
        return data.map(university => ({
          id: university.id,
          title: university.university_name,
          location: university.location,
          ranking: university.ranking,
          fields: university.fields || [],
          studyLevel: university.study_level,
          acceptance: getAcceptanceRate(university.ranking),
          image: university.image,
          url: university.url,
          description: university.description,
          programs: university.programs || []
        }));
      
      case 'products':
        return data.map(product => ({
          id: product.id || product.product_id,
          title: product.product_title,
          price: product.product_price,
          originalPrice: product.product_original_price || '',
          brand: extractBrand(product.product_title),
          rating: product.product_rating,
          image: product.product_image,
          description: extractDescription(product.product_title),
          source: product.product_source,
          url: product.product_url,
          discount: calculateDiscount(product.product_price, product.product_original_price),
          searchQuery: product.search_query
        }));
      
      default:
        return data;
    }
  };

  // Helper functions
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  const getAcceptanceRate = (ranking) => {
    if (!ranking) return 'N/A';
    const rankNum = parseInt(ranking);
    if (isNaN(rankNum)) return 'N/A';
    
    if (rankNum <= 10) return '4-7%';
    if (rankNum <= 50) return '10-20%';
    if (rankNum <= 100) return '20-30%';
    return '30-50%';
  };

  const extractBrand = (title) => {
    if (!title) return 'Unknown Brand';
    const brands = ['Apple', 'Sony', 'Nintendo', 'Dyson', 'Samsung', 'Microsoft', 'Google', 'Amazon'];
    for (const brand of brands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return 'Unknown Brand';
  };

  const extractDescription = (title) => {
    if (!title) return 'Product available';
    return `${title.substring(0, 50)}...`;
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || !price) return '';
    try {
      const priceNum = parseFloat(price.replace(/[^\d.-]/g, ''));
      const originalNum = parseFloat(originalPrice.replace(/[^\d.-]/g, ''));
      if (originalNum > priceNum && originalNum > 0) {
        const discount = ((originalNum - priceNum) / originalNum * 100).toFixed(0);
        return `${discount}% OFF`;
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  // UI Components
  const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-800">
        <LogIn className="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Login Required</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed mb-6">
        You need to be logged in to view your search history.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate('/auth/login')}
          className="px-6"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Log In
        </Button>
        <Button 
          onClick={() => navigate('/auth/signup')}
          variant="outline"
        >
          Sign Up
        </Button>
      </div>
    </div>
  );

  const EmptyState = ({ message, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-800">
        <Icon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No History Yet</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">{message}</p>
      <Button 
        onClick={() => navigateToSearch(iconToRoute(Icon))}
        className="mt-6"
      >
        Start Searching
      </Button>
    </div>
  );

  const iconToRoute = (Icon) => {
    if (Icon === Briefcase) return '/jobs';
    if (Icon === GraduationCap) return '/universities';
    if (Icon === ShoppingBag) return '/products';
    return '/';
  };

  const navigateToSearch = (route) => {
    navigate(route);
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Loading History</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">
        Fetching your saved opportunities...
      </p>
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 border border-red-100 dark:border-red-800">
        <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Something went wrong</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg leading-relaxed">{message}</p>
      <div className="flex gap-3 mt-6">
        <Button 
          onClick={() => {
            if (isAuthenticated) {
              handleRefresh();
            } else {
              navigate('/auth/login');
            }
          }}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button 
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </div>
    </div>
  );

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'jobs': return userJobs;
      case 'scholarships': return userScholarships;
      case 'universities': return userUniversities;
      case 'products': return userProducts;
      default: return [];
    }
  };

  const getCurrentIcon = () => {
    switch (activeTab) {
      case 'jobs': return Briefcase;
      case 'scholarships': return GraduationCap;
      case 'universities': return GraduationCap;
      case 'products': return ShoppingBag;
      default: return HistoryIcon;
    }
  };

  const currentData = getCurrentData();
  const currentIcon = getCurrentIcon();

  // If not authenticated, show login prompt
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-8 bg-gray-50/30 dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gray-100/80 via-white/50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-100/40 via-violet-100/40 to-emerald-100/40 dark:from-blue-900/10 dark:via-violet-900/10 dark:to-emerald-900/10 blur-[120px] pointer-events-none rounded-full opacity-60" />

        <div className="max-w-7xl mx-auto relative z-10 pt-4">
          <div className="flex flex-col items-center text-center mb-8 md:mb-16 space-y-4 md:space-y-6 animate-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center justify-center p-3 md:p-4 bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 ring-1 ring-gray-100 dark:ring-gray-800">
              <HistoryIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-900 dark:text-white" />
            </div>
            
            <div className="space-y-3 md:space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600">History</span>
              </h1>
              <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                View your search history across jobs, scholarships, universities, and products.
              </p>
            </div>
          </div>
          
          <LoginPrompt />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-8 bg-gray-50/30 dark:bg-gray-950 relative overflow-hidden">
      
      {/* Premium Background Elements */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-gray-100/80 via-white/50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-blue-100/40 via-violet-100/40 to-emerald-100/40 dark:from-blue-900/10 dark:via-violet-900/10 dark:to-emerald-900/10 blur-[120px] pointer-events-none rounded-full opacity-60" />

      <div className="max-w-7xl mx-auto relative z-10 pt-4">
        
        {/* Centered Page Header - Adjusted for mobile */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-16 space-y-4 md:space-y-6 animate-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 ring-1 ring-gray-100 dark:ring-gray-800">
            <HistoryIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-900 dark:text-white" />
          </div>
          
          <div className="space-y-3 md:space-y-4 max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600">History</span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Browse through your previously viewed jobs, scholarships, universities, and products.
            </p>
            
            {error && !isLoading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {isLoading && !currentData.length ? (
          <LoadingState />
        ) : error && !isAuthenticated ? (
          <ErrorState message={error} />
        ) : (
          <Tabs defaultValue="jobs" className="space-y-8 md:space-y-10" onValueChange={setActiveTab}>
            
            {/* RESPONSIVE Floating Tab Bar */}
            <div className={`sticky ${isMobile ? 'top-16 z-30' : 'top-20 md:top-24 z-30'} mb-4 md:mb-0`}>
              <div className="flex justify-center">
                <div className="inline-flex flex-col sm:flex-row items-center p-1.5 md:p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-black/20 gap-1.5 md:gap-2 w-full sm:w-auto mx-2 sm:mx-0">
                  <TabsList className="bg-transparent h-auto p-0 gap-0.5 md:gap-1 w-full sm:w-auto flex flex-wrap justify-center sm:flex-nowrap">
                    <TabsTrigger 
                      value="jobs" 
                      className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-500 dark:text-gray-400 font-medium md:font-semibold transition-all gap-1.5 md:gap-2 shadow-none text-xs md:text-sm min-w-[60px]"
                    >
                      <Briefcase className="w-3 h-3 md:w-4 md:h-4" /> 
                      {isMobile ? 'Jobs' : 'Jobs'} 
                      <span className="opacity-40 ml-1 md:ml-1.5 text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                        {userJobs.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="scholarships" 
                      className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-500 dark:text-gray-400 font-medium md:font-semibold transition-all gap-1.5 md:gap-2 shadow-none text-xs md:text-sm min-w-[60px]"
                    >
                      <GraduationCap className="w-3 h-3 md:w-4 md:h-4" /> 
                      {isMobile ? 'Scholar' : 'Scholarships'} 
                      <span className="opacity-40 ml-1 md:ml-1.5 text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                        {userScholarships.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="universities" 
                      className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-500 dark:text-gray-400 font-medium md:font-semibold transition-all gap-1.5 md:gap-2 shadow-none text-xs md:text-sm min-w-[60px]"
                    >
                      <GraduationCap className="w-3 h-3 md:w-4 md:h-4" /> 
                      {isMobile ? 'Uni' : 'Universities'} 
                      <span className="opacity-40 ml-1 md:ml-1.5 text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                        {userUniversities.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="products" 
                      className="px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-500 dark:text-gray-400 font-medium md:font-semibold transition-all gap-1.5 md:gap-2 shadow-none text-xs md:text-sm min-w-[60px]"
                    >
                      <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> 
                      {isMobile ? 'Products' : 'Products'} 
                      <span className="opacity-40 ml-1 md:ml-1.5 text-[10px] md:text-xs font-bold px-1 md:px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded">
                        {userProducts.length}
                      </span>
                    </TabsTrigger>
                    
                    {/* Refresh Button - Mobile: icon only, Desktop: with text */}
                    <div className="flex items-center px-1.5 md:px-2">
                      <div className="w-px h-4 md:h-6 bg-gray-200 dark:bg-gray-700 mx-1 md:mx-2"></div>
                      <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        variant="ghost"
                        size="sm"
                        className="h-7 md:h-8 px-2 md:px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {isRefreshing ? (
                          <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        )}
                        {!isMobile && (
                          <span className="ml-1.5 text-xs font-medium">
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                          </span>
                        )}
                      </Button>
                    </div>
                  </TabsList>
                </div>
              </div>
            </div>

            {/* Jobs Content */}
            <TabsContent value="jobs" className="focus:outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
              {isRefreshing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin mb-3 md:mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Refreshing jobs history...</span>
                </div>
              ) : userJobs.length > 0 ? (
                <div className="space-y-4 md:space-y-6">
                  {userJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="You haven't viewed any jobs yet. Start your job search to see them here!" 
                  icon={Briefcase} 
                />
              )}
            </TabsContent>

            {/* Scholarships Content */}
            <TabsContent value="scholarships" className="focus:outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
              {isRefreshing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin mb-3 md:mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Refreshing scholarships history...</span>
                </div>
              ) : userScholarships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {userScholarships.map((scholarship) => (
                    <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="You haven't viewed any scholarships yet. Browse scholarships to see them here!" 
                  icon={GraduationCap} 
                />
              )}
            </TabsContent>

            {/* Universities Content */}
            <TabsContent value="universities" className="focus:outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
              {isRefreshing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin mb-3 md:mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Refreshing universities history...</span>
                </div>
              ) : userUniversities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {userUniversities.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="You haven't viewed any universities yet. Search for universities to see them here!" 
                  icon={GraduationCap} 
                />
              )}
            </TabsContent>

            {/* Products Content */}
            <TabsContent value="products" className="focus:outline-none animate-in fade-in slide-in-from-bottom-8 duration-700">
              {isRefreshing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-blue-500 animate-spin mb-3 md:mb-4" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Refreshing products history...</span>
                </div>
              ) : userProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {userProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      showVisitSiteButton={true}
                      userId={userId}
                      onTrackVisit={() => {
                        console.log('Product visited:', product.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState 
                  message="You haven't viewed any products yet. Shop around to see them here!" 
                  icon={ShoppingBag} 
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default History;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  ShoppingBag, 
  MapPin,
  Globe,
  DollarSign,
  Clock,
  Edit,
  Search,
  History as HistoryIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [recentSearches, setRecentSearches] = useState({
    jobs: [],
    universities: [],
    products: [],
    all: [] // New array for all merged searches
  });
  const [showType, setShowType] = useState('all'); // 'all', 'jobs', 'universities', 'products'
  const navigate = useNavigate();
  const { toast } = useToast();

  // Storage keys
  const KEYS = {
    JOBS: 'jobSearchHistory',
    UNI: 'universitySearchHistory',
    PRODUCTS: 'productSearchHistory'
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      toast({
        title: "Please Login",
        description: "You need to login to view your profile",
        variant: "destructive"
      });
      navigate('/auth/login');
      return;
    }

    // Load user data from localStorage
    loadUserData();
    
    // Load recent searches from localStorage
    loadRecentSearches();
  }, [navigate, toast]);

  const loadUserData = () => {
    try {
      // Try to get user from localStorage
      const userData = localStorage.getItem('user');
      const userInfo = localStorage.getItem('user_info');
      
      let userObj = null;
      
      // Try user_info first (this should have the full user object)
      if (userInfo) {
        userObj = JSON.parse(userInfo);
      } 
      // Fall back to user data
      else if (userData) {
        userObj = JSON.parse(userData);
      }
      
      if (userObj) {
        setUser(userObj);
      } else {
        console.error('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  };

  const loadRecentSearches = () => {
    try {
      const jobs = JSON.parse(localStorage.getItem(KEYS.JOBS) || '[]');
      const universities = JSON.parse(localStorage.getItem(KEYS.UNI) || '[]');
      const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');

      // Add type property to each item for identification
      const typedJobs = jobs.map(item => ({ ...item, type: 'job' }));
      const typedUniversities = universities.map(item => ({ ...item, type: 'university' }));
      const typedProducts = products.map(item => ({ ...item, type: 'product' }));

      // Merge all searches and sort by timestamp (newest first)
      const allSearches = [...typedJobs, ...typedUniversities, ...typedProducts]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10); // Get top 10 most recent across all types

      // Also keep the original separated arrays for filtering
      const latestJobs = typedJobs.slice(0, 5);
      const latestUniversities = typedUniversities.slice(0, 5);
      const latestProducts = typedProducts.slice(0, 5);

      setRecentSearches({
        jobs: latestJobs,
        universities: latestUniversities,
        products: latestProducts,
        all: allSearches
      });
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  };

  // Helper to get user property safely
  const getUserProperty = (property) => {
    if (!user) return '';
    
    // Check for both underscore and no-underscore versions
    if (property === 'first_name' || property === 'firstname') {
      return user.first_name || user.firstname || '';
    }
    
    if (property === 'last_name' || property === 'lastname') {
      return user.last_name || user.lastname || '';
    }
    
    if (property === 'full_name') {
      return user.full_name || `${getUserProperty('first_name')} ${getUserProperty('last_name')}`.trim() || '';
    }
    
    // For other properties like email, role, etc.
    return user[property] || '';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    
    const firstName = getUserProperty('first_name');
    const lastName = getUserProperty('last_name');
    const email = getUserProperty('email');
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const getUserName = () => {
    if (!user) return 'User';
    
    // Try full_name first
    const fullName = getUserProperty('full_name');
    if (fullName && fullName.trim()) {
      return fullName;
    }
    
    // Try first + last name
    const firstName = getUserProperty('first_name');
    const lastName = getUserProperty('last_name');
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    
    // Fallback to email username
    const email = getUserProperty('email');
    if (email) {
      return email.split('@')[0];
    }
    
    return 'User';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleSearchClick = (type, searchData) => {
    switch(type) {
      case 'job':
        navigate('/jobs', { state: { restoreSearch: searchData } });
        break;
      case 'university':
        navigate('/universities', { state: { restoreSearch: searchData } });
        break;
      case 'product':
        navigate('/products', { state: { restoreSearch: searchData } });
        break;
      default:
        break;
    }
  };

  const renderSearchItem = (item) => {
    const config = {
      job: {
        icon: Briefcase,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        label: 'Job Search'
      },
      university: {
        icon: GraduationCap,
        bgColor: 'bg-violet-100 dark:bg-violet-900/30',
        textColor: 'text-violet-600 dark:text-violet-400',
        label: 'Education'
      },
      product: {
        icon: ShoppingBag,
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        label: 'Product'
      }
    };

    const { icon: Icon, bgColor, textColor, label } = config[item.type];

    let title = '';
    let subtitle = '';
    let details = [];

    switch(item.type) {
      case 'job':
        title = item.query || 'Job Search';
        subtitle = `${item.city || ''}${item.city && item.countryName ? ', ' : ''}${item.countryName || ''}`;
        if (item.countryCode) {
          details.push({ icon: MapPin, text: item.countryCode });
        }
        break;
      
      case 'university':
        title = item.country || 'Country Search';
        subtitle = item.field === 'all' ? 'All Fields' : item.field || 'All Fields';
        details.push({ 
          icon: GraduationCap, 
          text: item.studyLevel || 'All Levels' 
        });
        if (item.activeTab) {
          details.push({ 
            icon: Globe, 
            text: item.activeTab === 'scholarships' ? 'Scholarships' : 'Universities' 
          });
        }
        break;
      
      case 'product':
        title = item.query || 'Product Search';
        subtitle = (!item.minPrice && !item.maxPrice) ? 'No price filter' : 'Custom Price Range';
        if (item.minPrice || item.maxPrice) {
          details.push({ 
            icon: DollarSign, 
            text: `${item.minPrice || 0} - ${item.maxPrice || '∞'}` 
          });
        }
        break;
    }

    return (
      <div 
        key={`${item.type}-${item.timestamp}`}
        onClick={() => handleSearchClick(item.type, item)}
        className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900"
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${textColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
                {label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(item.timestamp)}
              </span>
            </div>
            
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h4>
            
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                {subtitle}
              </p>
            )}
            
            {details.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {details.map((detail, idx) => {
                  const DetailIcon = detail.icon;
                  return (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300"
                    >
                      <DetailIcon className="w-3 h-3" />
                      {detail.text}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const hasRecentSearches = recentSearches.all.length > 0;

  // Extract user info for display
  const firstName = getUserProperty('first_name');
  const lastName = getUserProperty('last_name');
  const email = getUserProperty('email');
  const role = getUserProperty('role');
  const fullName = getUserName();

  // Get filtered searches based on selected type
  const getFilteredSearches = () => {
    if (showType === 'all') {
      return recentSearches.all;
    } else if (showType === 'jobs') {
      return recentSearches.jobs;
    } else if (showType === 'universities') {
      return recentSearches.universities;
    } else if (showType === 'products') {
      return recentSearches.products;
    }
    return recentSearches.all;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account and view your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {getUserInitials()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  {fullName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-2">
                  {email}
                </p>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                  {role || 'user'}
                </span>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Email Address</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{email}</span>
                  </div>
                </div>

                {firstName && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">First Name</label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{firstName}</span>
                    </div>
                  </div>
                )}

                {lastName && (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Name</label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{lastName}</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/history')}
                  className="w-full mt-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <HistoryIcon className="w-4 h-4" />
                  View Full History
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <button 
                  onClick={loadRecentSearches}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <Search className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                  onClick={() => setShowType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showType === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Activity
                </button>
                <button
                  onClick={() => setShowType('jobs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showType === 'jobs' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setShowType('universities')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showType === 'universities' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Education
                </button>
                <button
                  onClick={() => setShowType('products')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    showType === 'products' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Products
                </button>
              </div>

              {!hasRecentSearches ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <HistoryIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No recent activity
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    Your recent searches will appear here. Start exploring jobs, universities, and products!
                  </p>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button 
                      onClick={() => navigate('/jobs')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Find Jobs
                    </button>
                    <button 
                      onClick={() => navigate('/universities')}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg text-sm font-medium transition-colors"
                    >
                      Browse Universities
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredSearches().length > 0 ? (
                    getFilteredSearches().map(item => renderSearchItem(item))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        {showType === 'jobs' && <Briefcase className="w-8 h-8 text-gray-400" />}
                        {showType === 'universities' && <GraduationCap className="w-8 h-8 text-gray-400" />}
                        {showType === 'products' && <ShoppingBag className="w-8 h-8 text-gray-400" />}
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No recent {showType} searches
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                        Your recent {showType} searches will appear here.
                      </p>
                      <div className="mt-6">
                        <button 
                          onClick={() => navigate(`/${showType}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Explore {showType === 'universities' ? 'Education' : showType}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
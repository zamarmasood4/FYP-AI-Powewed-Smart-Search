import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  History as HistoryIcon,
  Search, 
  Home,
  Briefcase, 
  ShoppingBag, 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  Tag, 
  Sparkles,
  LogOut // Add this import
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown'; // Adjust path as needed

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  useEffect(() => {
    setIsMenuOpen(false);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      const userInfo = localStorage.getItem('user_info');
      
      if (accessToken && (userData || userInfo)) {
        setIsLoggedIn(true);
        try {
          // Try user_info first, then user
          const userObj = userInfo ? JSON.parse(userInfo) : userData ? JSON.parse(userData) : null;
          setUser(userObj);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuthStatus();
    
    // Listen for storage changes to update auth status
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check on route change
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const isActive = (path) => location.pathname === path;
  const isAuthPage = location.pathname.startsWith('/auth');
  const isHomePage = location.pathname === '/';

  // Don't show navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 py-4 px-6 transition-all duration-300 ${
      scrolled || !isHomePage ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group relative z-50">
          <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/80 to-teal-400/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Search className="h-5 w-5 text-white absolute z-10" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">SearchAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-1">
          <NavLink to="/" isActive={isActive('/')} icon={<Home className="w-4 h-4" />} label="Home" />
          <NavLink to="/jobs" isActive={isActive('/jobs')} icon={<Briefcase className="w-4 h-4" />} label="Jobs" />
          <NavLink to="/products" isActive={isActive('/products')} icon={<ShoppingBag className="w-4 h-4" />} label="Products" />
          <NavLink to="/universities" isActive={isActive('/universities')} icon={<GraduationCap className="w-4 h-4" />} label="Universities" />
          {/* <NavLink to="/price-comparison" isActive={isActive('/price-comparison')} icon={<Tag className="w-4 h-4" />} label="Compare" /> */}
          {/* <NavLink to="/recommendations" isActive={isActive('/recommendations')} icon={<Sparkles className="w-4 h-4" />} label="For You" /> */}
        </div>
        
        {/* Auth Button or Profile Dropdown */}
        <div className="hidden md:block">
          {isLoggedIn ? (
            <ProfileDropdown user={user} />
          ) : (
            <Link 
              to="/auth/login" 
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-card mt-2 mx-4 p-4 rounded-xl shadow-lg animate-fade-in z-50">
          <div className="flex flex-col space-y-3">
            <MobileNavLink to="/" isActive={isActive('/')} icon={<Home className="w-5 h-5" />} label="Home" onClick={toggleMenu} />
            <MobileNavLink to="/jobs" isActive={isActive('/jobs')} icon={<Briefcase className="w-5 h-5" />} label="Jobs" onClick={toggleMenu} />
            <MobileNavLink to="/products" isActive={isActive('/products')} icon={<ShoppingBag className="w-5 h-5" />} label="Products" onClick={toggleMenu} />
            <MobileNavLink to="/universities" isActive={isActive('/universities')} icon={<GraduationCap className="w-5 h-5" />} label="Universities" onClick={toggleMenu} />
            {/* <MobileNavLink to="/price-comparison" isActive={isActive('/price-comparison')} icon={<Tag className="w-5 h-5" />} label="Price Comparison" onClick={toggleMenu} /> */}
            {/* <MobileNavLink to="/recommendations" isActive={isActive('/recommendations')} icon={<Sparkles className="w-5 h-5" />} label="Recommendations" onClick={toggleMenu} /> */}
            
            {isLoggedIn ? (
              <>
                <MobileNavLink to="/profile" isActive={isActive('/profile')} icon={<User className="w-5 h-5" />} label="Profile" onClick={toggleMenu} />
                <MobileNavLink to="/history" isActive={isActive('/history')} icon={<HistoryIcon className="w-5 h-5" />} label="History" onClick={toggleMenu} />
                <button 
                  onClick={() => {
                    // Mobile logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('user_info');
                    toggleMenu();
                    window.location.reload();
                  }}
                  className="px-4 py-3 rounded-lg flex items-center space-x-3 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <MobileNavLink to="/auth/login" isActive={isActive('/auth/login')} icon={<User className="w-5 h-5" />} label="Sign in" onClick={toggleMenu} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, isActive, icon, label }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-full flex items-center space-x-1 transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, isActive, icon, label, onClick }) => (
  <Link
    to={to}
    className={`px-4 py-3 rounded-lg flex items-center space-x-3 transition-all ${
      isActive 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;
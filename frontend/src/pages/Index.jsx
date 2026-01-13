// File: src/pages/Index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { 
  Search, Briefcase, ShoppingBag, GraduationCap, ChevronRight, Tag, Sparkles, 
  ArrowRight, CheckCircle, Zap, Users, Shield, Clock, Award, Heart, Phone,
  ArrowDown, Globe, Code, Cpu, Database, BarChart3, Compass, Star,
  LineChart, Settings, MessageSquare, Filter, ArrowUpRight, BellRing, PenTool,
  LightbulbIcon, Send, Rocket, Target, ArrowRightCircle, Bookmark, MapPin, 
  Music, Gift, Headphones, Book, Tv, Coffee, Store, Building, Laptop, Check, X,
  Bot, User, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Command, CommandInput } from "@/components/ui/command";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import JobCard from '../components/JobCard';
import ProductCard from '../components/ProductCard';
import UniversityCard from '../components/UniversityCard';
import { PriceComparisonCardSkeleton, ProductCardSkeleton, UniversityCardSkeleton } from '../components/SearchResults';

// Chatbot Component
const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI assistant. I can help you search for jobs, products, universities, scholarships, or answer any questions about the world. How can I assist you today?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyDAqOzI2Sx55tWXiYr7URw7I4uLYl_t2nU';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  // Function to send message to Gemini API
  const sendMessageToAI = async (prompt) => {
    try {
      // Create context-aware prompt for the search platform
      const enhancedPrompt = `You are a helpful assistant for a universal search platform called "Search Everything" that helps users find jobs, products, universities, and scholarships.
      
Platform Context:
- Jobs: Senior Frontend Developer, UX/UI Designer, Remote Work, Tech Jobs
- Products: Pro Laptop X1, Wireless Headphones Pro, Electronics, Fashion
- Universities: Tech Institute, Global University, Computer Science, Engineering
- Scholarships: Merit-Based, Need-Based, International, Undergraduate

User Query: "${prompt}"

Instructions:
1. If the user is searching for jobs, provide advice on job search strategies and suggest using the Jobs category with keywords like "remote", "tech", "developer", "designer".
2. If the user is searching for products, suggest how to refine product searches and mention categories like "electronics", "fashion", "home goods".
3. If the user is searching for universities or scholarships, provide guidance on research and comparison, and suggest relevant programs.
4. For general knowledge questions, provide accurate, concise information about the topic.
5. Always encourage using the platform's specific search features for better results.

Response Guidelines:
- Be helpful, friendly, and engaging
- Keep responses concise (2-4 sentences)
- Use markdown formatting for readability
- End with a helpful suggestion or question
- If relevant, mention specific categories from the platform`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I apologize, but I'm having trouble processing your request right now. You can try using our search functionality directly for jobs, products, universities, or scholarships.";
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(inputText);
      
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again or use the search features directly.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "Find remote software jobs",
    "Best laptop deals today",
    "Top universities for MBA",
    "Scholarships for international students",
    "What is quantum computing?"
  ];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Chatbot Container - Now on LEFT side */}
      <div className={`absolute bottom-0 left-0 w-full max-w-md h-[70vh] max-h-[600px] transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <Card className="w-full h-full shadow-2xl border-gray-200 dark:border-gray-700 flex flex-col rounded-t-xl rounded-b-none rounded-l-none">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-sm text-white/80">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`mt-2 ${message.sender === 'user' ? 'hidden' : 'block'}`}>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className={`mt-2 ${message.sender === 'user' ? 'block' : 'hidden'}`}>
                    <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {message.text}
                    </div>
                    <div className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="mt-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs rounded-full hover:bg-blue-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      setInputText(suggestion);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask about jobs, products, universities, or anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-full"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputText.trim()}
                className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by Gemini 2.5 Flash • Search across jobs, products, universities & scholarships
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Main Index Component
const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Determine which page to redirect to based on query
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('job') || lowerQuery.includes('career') || lowerQuery.includes('work')) {
        window.location.href = `/jobs?q=${encodeURIComponent(query)}`;
      } else if (lowerQuery.includes('product') || lowerQuery.includes('buy') || lowerQuery.includes('shop')) {
        window.location.href = `/products?q=${encodeURIComponent(query)}`;
      } else if (lowerQuery.includes('university') || lowerQuery.includes('college') || lowerQuery.includes('education') || lowerQuery.includes('scholarship')) {
        window.location.href = `/universities?q=${encodeURIComponent(query)}`;
      } else {
        // Default to general search results showing all categories
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }
  };

  const categoryCards = [
    {
      title: "Jobs",
      description: "Find your dream career opportunities",
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800/30",
      gradient: "from-blue-500 to-indigo-600",
      link: "/jobs",
      items: ["Remote Work", "Tech Jobs", "Full-time", "Part-time", "Freelance"]
    },
    {
      title: "Products",
      description: "Discover top-rated products and deals",
      icon: <ShoppingBag className="h-6 w-6 text-emerald-500" />,
      color: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/30",
      gradient: "from-emerald-500 to-teal-600",
      link: "/products",
      items: ["Electronics", "Fashion", "Home Goods", "Beauty", "Sports"]
    },
    {
      title: "Universities",
      description: "Explore top educational institutions",
      icon: <GraduationCap className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800/30",
      gradient: "from-purple-500 to-indigo-600",
      link: "/universities",
      items: ["Top Ranked", "Online Programs", "Scholarships", "MBA", "Engineering"]
    },
    {
      title: "Scholarships",
      description: "Find scholarships and financial aid opportunities",
      icon: <Award className="h-6 w-6 text-purple-500" />,
      color: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800/30",
      gradient: "from-green-500 to-emerald-600",
      link: "/scholarships",
      items: ["Merit-Based", "Need-Based", "International", "Undergraduate", "Postgraduate"]
    }
  ];

  const FeatureCard = ({ icon, title, description, gradient }) => (
    <div className={`glass-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 dark:border-white/10 backdrop-blur-sm transform hover:scale-[1.02]`}>
      <div className={`h-14 w-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );

  const StatCard = ({ icon, value, label, color }) => (
    <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center transform hover:scale-[1.03]">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-10 dark:bg-opacity-20 mb-4`}>
        {icon}
      </div>
      <h3 className={`text-3xl font-bold mb-1 ${color}`}>{value}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
    </div>
  );

  const TestimonialCard = ({ quote, name, title, avatar }) => (
    <div className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden transform hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full -mr-10 -mt-10 z-0"></div>
      <div className="relative z-10">
        <div className="mb-6 text-lg text-gray-700 dark:text-gray-300 italic">"{quote}"</div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sampleJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc",
      logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop",
      location: "Remote",
      salary: "$120k - $150k",
      experience: "5+ years",
      type: "Full-time",
      posted: "2 days ago",
      description: "Join our dynamic team and help build the next generation of web applications."
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "DesignLab",
      logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=200&fit=crop",
      location: "New York, NY",
      salary: "$90k - $120k",
      experience: "3+ years",
      type: "Full-time",
      posted: "1 week ago",
      description: "Create beautiful and intuitive user interfaces for our products."
    }
  ];

  const sampleUniversities = [
    {
      id: 1,
      name: "Tech Institute",
      image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=800&h=600&fit=crop",
      location: "San Francisco, CA",
      ranking: "#15 in Tech",
      tuition: "$45,000/year",
      programs: ["Computer Science", "Data Science", "AI", "Cybersecurity"],
      acceptance: "85%"
    },
    {
      id: 2,
      name: "Global University",
      image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop",
      location: "Boston, MA",
      ranking: "#8 in Engineering",
      tuition: "$52,000/year",
      programs: ["Engineering", "Business", "Design", "Medicine"],
      acceptance: "75%"
    }
  ];

  const sampleProducts = [
    {
      id: 1,
      name: "Pro Laptop X1",
      brand: "TechGear",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
      price: 1299.99,
      originalPrice: 1499.99,
      rating: "4.8",
      reviews: 245,
      discount: "-15%",
      description: "Premium laptop with the latest processor and stunning display."
    },
    {
      id: 2,
      name: "Wireless Headphones Pro",
      brand: "AudioTech",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
      price: 199.99,
      originalPrice: 249.99,
      rating: "4.6",
      reviews: 182,
      discount: "-20%",
      description: "High-quality wireless headphones with noise cancellation."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 page-transition">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-100 to-violet-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 -z-10">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse" 
            style={{ animationDuration: '15s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-500/20 rounded-full filter blur-3xl animate-pulse" 
            style={{ animationDuration: '25s' }} />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse" 
            style={{ animationDuration: '20s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse" 
            style={{ animationDuration: '18s' }} />
        </div>
        
        {/* Hero content container */}
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center z-10">
          <div className={`transition-all duration-500 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30 shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>AI-Powered Universal Search</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 drop-shadow-sm">
                Search Everything
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Find jobs, products, universities, and scholarships all in one place with our intelligent search platform.
            </p>
            
            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link to="/jobs" className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Jobs
              </Link>
              <Link to="/products" className="px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-medium">
                <ShoppingBag className="w-4 h-4 inline mr-2" />
                Products
              </Link>
              <Link to="/universities" className="px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-medium">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Universities
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot Toggle Button - Now on LEFT side with different z-index */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 z-40"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        aria-label={isChatbotOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isChatbotOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
        )}
      </Button>
      
      {/* Chatbot Component - Now on LEFT side */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
      
      {/* Category Cards Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <Bookmark className="h-4 w-4 mr-2" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
              Search Across Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
              Discover tailored search results organized by category to help you find exactly what you need.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryCards.map((card, index) => (
              <Card key={index} className={`overflow-hidden group hover:shadow-xl transition-all duration-300 ${card.color} ${card.border} border-2 h-full transform hover:scale-[1.03] hover:rotate-1`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} p-3 shadow-md text-white`}>
                      {card.icon}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 rounded-full p-0" asChild>
                      <Link to={card.link}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {card.items.map((item, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full text-sm gap-1 group" asChild>
                    <Link to={card.link}>
                      Explore {card.title}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <div id="features" className="py-28 px-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Everything You Need in One Place
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our intelligent platform combines cutting-edge AI with user-friendly design to deliver an unmatched search experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="h-6 w-6 text-white" />}
              title="Smart Search" 
              description="Our AI understands natural language queries and delivers highly relevant results."
              gradient="from-blue-500 to-indigo-600"
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-white" />}
              title="Lightning Fast" 
              description="Get instant results with our optimized search algorithm that prioritizes speed."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Privacy First" 
              description="Your search data is encrypted and never sold to third parties."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard 
              icon={<Heart className="h-6 w-6 text-white" />}
              title="Personalized Results" 
              description="The more you use our platform, the better it understands your preferences."
              gradient="from-pink-500 to-rose-600"
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-white" />}
              title="Global Coverage" 
              description="Search across millions of sources worldwide for the most comprehensive results."
              gradient="from-violet-500 to-purple-600"
            />
            <FeatureCard 
              icon={<Phone className="h-6 w-6 text-white" />}
              title="Mobile Optimized" 
              description="Take the power of AI search with you on all your devices with our responsive design."
              gradient="from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <section className="py-28 px-6 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/40 dark:to-teal-900/40 text-teal-600 dark:text-teal-400 text-sm font-medium mb-4 shadow-sm backdrop-blur-sm">
              <Rocket className="h-4 w-4 mr-2" />
              <span>Simple & Powerful</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Our platform is designed to be intuitive and efficient, helping you find what you need in just a few steps.
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-1/2 top-24 bottom-24 w-0.5 bg-gradient-to-b from-blue-500 via-teal-500 to-emerald-500 hidden lg:block">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-teal-500 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
              <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>
            </div>
            
            <div className="space-y-16 lg:space-y-0">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                <div className="lg:w-1/2 order-2 lg:order-1">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-3xl p-8 lg:p-10 border-2 border-blue-200 dark:border-blue-800/30 relative overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
                    <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-blue-200/50 dark:bg-blue-800/20 rounded-full"></div>
                    <div className="absolute -left-24 -top-24 w-48 h-48 bg-indigo-200/50 dark:bg-indigo-800/20 rounded-full"></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mr-5">
                          <Search className="h-8 w-8 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 h-10 w-10 rounded-full flex items-center justify-center border-2 border-blue-300 dark:border-blue-700 shadow-md">
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Enter Your Query</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                        Simply type what you're looking for in natural language. Our advanced AI understands context and intent to provide the most relevant results.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 order-1 lg:order-2 flex justify-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full filter blur-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 p-10">
                        <MessageSquare className="w-full h-full text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                <div className="lg:w-1/2 order-2">
                  <div className="bg-teal-50 dark:bg-teal-950/30 rounded-3xl p-8 lg:p-10 border-2 border-teal-200 dark:border-teal-800/30 relative overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
                    <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-teal-200/50 dark:bg-teal-800/20 rounded-full"></div>
                    <div className="absolute -left-24 -top-24 w-48 h-48 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-full"></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 mr-5">
                          <Target className="h-8 w-8 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 h-10 w-10 rounded-full flex items-center justify-center border-2 border-teal-300 dark:border-teal-700 shadow-md">
                          <span className="text-xl font-bold text-teal-600 dark:text-teal-400">2</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 text-teal-700 dark:text-teal-300">Smart AI Analysis</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                        Our powerful AI engine analyzes your query, understands context, and searches across millions of sources to find the perfect match.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 order-1 lg:order-1 flex justify-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full filter blur-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-teal-500/30 p-10">
                        <Code className="w-full h-full text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                <div className="lg:w-1/2 order-2 lg:order-1">
                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-3xl p-8 lg:p-10 border-2 border-purple-200 dark:border-purple-800/30 relative overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
                    <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-purple-200/50 dark:bg-purple-800/20 rounded-full"></div>
                    <div className="absolute -left-24 -top-24 w-48 h-48 bg-violet-200/50 dark:bg-violet-800/20 rounded-full"></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mr-5">
                          <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 h-10 w-10 rounded-full flex items-center justify-center border-2 border-purple-300 dark:border-purple-700 shadow-md">
                          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-300">Personalized Results</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                        Discover precisely what you're looking for with tailored results that match your specific needs and improve over time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2 order-1 lg:order-2 flex justify-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full filter blur-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30 p-10">
                        <Sparkles className="w-full h-full text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="flex justify-center mt-20">
            <Link to="/auth/register" className="btn-primary px-8 py-4 rounded-full text-white bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 hover:from-blue-700 hover:via-teal-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl hover:shadow-teal-500/20 dark:hover:shadow-teal-700/20 transition-all flex items-center gap-2 text-lg font-medium transform hover:scale-105 duration-300 group">
              Try It Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <div className="py-24 px-6 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Trusted by Users Worldwide</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform is helping millions of people find exactly what they're looking for.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard 
              icon={<Users className="h-6 w-6" />}
              value="1M+" 
              label="Active Users"
              color="text-blue-600 dark:text-blue-400"
            />
            <StatCard 
              icon={<Database className="h-6 w-6" />}
              value="500M+" 
              label="Indexed Items"
              color="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard 
              icon={<BarChart3 className="h-6 w-6" />}
              value="10M+" 
              label="Daily Searches"
              color="text-purple-600 dark:text-purple-400"
            />
            <StatCard 
              icon={<Award className="h-6 w-6" />}
              value="99.9%" 
              label="User Satisfaction"
              color="text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <section className="py-28 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
              <Star className="h-4 w-4 mr-2" />
              <span>User Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Thousands of users love our platform for its accuracy, speed, and ease of use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="This search platform has completely changed how I shop online. I find exactly what I want in seconds!"
              name="Sarah Johnson"
              title="E-commerce Manager"
              avatar="https://randomuser.me/api/portraits/women/32.jpg"
            />
            
            <TestimonialCard
              quote="As a student, I rely on this platform daily to find research papers and course materials. The AI suggestions are spot on."
              name="Marcus Chen"
              title="Graduate Student"
              avatar="https://randomuser.me/api/portraits/men/44.jpg"
            />
            
            <TestimonialCard
              quote="Finding qualified candidates used to take weeks. Now I can discover the perfect match for our job openings in minutes."
              name="Emily Rodriguez"
              title="HR Director"
              avatar="https://randomuser.me/api/portraits/women/65.jpg"
            />
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 shadow-sm backdrop-blur-sm">
            <PenTool className="h-4 w-4 mr-2" />
            <span>Stay Updated</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Join Our Newsletter</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Get the latest updates, tips and tricks for making the most of our search platform.
          </p>
          
          <div className="glass-card p-8 rounded-2xl border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-14 px-6 rounded-full bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30"
              />
              <Button className="h-14 px-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-700/20 font-medium flex items-center gap-2 whitespace-nowrap transform hover:scale-105 duration-300 group">
                Subscribe
                <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <div className="py-28 px-6 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Ready to Transform Your Search Experience?</h2>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-12">
            Join millions of satisfied users who've discovered the power of AI-enhanced search.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/auth/register" className="px-8 py-5 rounded-full bg-white text-indigo-700 shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-2 text-lg font-bold transform hover:scale-105 duration-300 group">
              Get Started Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link to="/contact" className="px-8 py-5 rounded-full bg-transparent border-2 border-white hover:bg-white/10 transition-all flex items-center gap-2 text-lg font-medium transform hover:scale-105 duration-300">
              Contact Sales
              <Phone className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
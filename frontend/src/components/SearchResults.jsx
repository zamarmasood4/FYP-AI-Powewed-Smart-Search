
import React from 'react';
import { CircleX, FileSearch } from 'lucide-react';

const SearchResults = ({ isLoading, results, children, emptyMessage }) => {
  if (isLoading) {
    return (
      <div className="mt-10 w-full max-w-3xl mx-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  if (results && results.length === 0) {
    return (
      <div className="mt-10 w-full max-w-3xl mx-auto text-center">
        <div className="p-8 glass-card flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {emptyMessage || "We couldn't find any matching results. Please try a different search."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-7xl mx-auto">
      {children}
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Create skeleton loaders for different card types
export const ProductCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="w-2/3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
          </div>
          <div className="h-8 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6 mb-4"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-20 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-14"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const UniversityCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        </div>
        <div className="mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-40 mb-2"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-32"></div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );
};

export const PriceComparisonCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="h-40 w-full md:w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="p-4 flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-11/12"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New enhanced AI recommendations explanation component
export const AiRecommendationsSection = () => {
  return (
    <div className="my-16 max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500">
          How Our AI Recommendations Work
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Our advanced algorithms create personalized recommendations just for you
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connected line between steps */}
        <div className="hidden md:block absolute top-32 left-[15%] right-[15%] h-1 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-500 z-0"></div>
        
        <RecommendationStep 
          number="1" 
          title="Data Collection"
          description="We analyze your search history, interests, and behavior patterns to understand your preferences."
          icon={<FileSearch className="h-8 w-8 text-white" />}
          iconBg="from-purple-500 to-purple-700"
        />
        
        <RecommendationStep 
          number="2" 
          title="AI Processing"
          description="Our machine learning algorithms detect patterns and identify products that match your interests."
          icon={<Search className="h-8 w-8 text-white" />}
          iconBg="from-blue-500 to-blue-700"
        />
        
        <RecommendationStep 
          number="3" 
          title="Personalized Results"
          description="You receive tailored recommendations that improve over time as you interact with the platform."
          icon={<Sparkles className="h-8 w-8 text-white" />}
          iconBg="from-teal-500 to-teal-700"
        />
      </div>
      
      <div className="mt-16 glass-card p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4">Our AI Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TechFeature 
            title="Collaborative Filtering"
            description="Recommends items based on preferences of users with similar taste profiles."
            iconClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
          
          <TechFeature 
            title="Content-Based Analysis"
            description="Suggests products with similar attributes to ones you've shown interest in."
            iconClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          
          <TechFeature 
            title="Real-Time Learning"
            description="Continuously improves as you interact with products and search results."
            iconClass="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
          />
          
          <TechFeature 
            title="Trend Analysis"
            description="Incorporates trending and popular items that match your interests."
            iconClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};

const RecommendationStep = ({ number, title, description, icon, iconBg }) => {
  return (
    <div className="glass-card p-8 relative z-10 flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${iconBg} flex items-center justify-center mb-4 relative`}>
        {icon}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-purple-500 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

const TechFeature = ({ title, description, iconClass }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-full ${iconClass} flex-shrink-0`}>
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default SearchResults;

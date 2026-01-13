import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import ProductCard from '../components/ProductCard';
import UniversityCard from '../components/UniversityCard';
import ScholarshipCard from '../components/ScholarshipCard';
import JobCardSkeleton from '../components/JobCardSkeleton';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import UniversityCardSkeleton from '../components/UniversityCardSkeleton';
import { fetchJobs, fetchProducts, fetchUniversities } from '../utils/api';
import { Search, Briefcase, ShoppingBag, GraduationCap, Award } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [jobs, setJobs] = useState([]);
  const [products, setProducts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (newQuery) => {
    setSearchQuery(newQuery);
    loadAllResults(newQuery);
  };

  const loadAllResults = async (searchTerm) => {
    setIsLoading(true);
    try {
      const [jobResults, productResults, universityResults] = await Promise.all([
        fetchJobs({ title: searchTerm }),
        fetchProducts({ name: searchTerm }),
        fetchUniversities({ name: searchTerm })
      ]);

      // Mock scholarship results
      const mockScholarships = [
        {
          id: 1,
          name: "Innovation Scholarship",
          provider: "Tech Foundation",
          amount: 35000,
          type: "Partial Tuition",
          description: "Supporting innovative students in technology and engineering.",
          level: "Undergraduate",
          location: "USA",
          deadline: "April 1, 2024",
          applicants: "950",
          fields: ["Technology", "Engineering", "Innovation"],
          difficulty: "Medium"
        }
      ];

      setJobs(jobResults.slice(0, 6));
      setProducts(productResults.slice(0, 6));
      setUniversities(universityResults.slice(0, 6));
      setScholarships(mockScholarships);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      loadAllResults(query);
    }
  }, [query]);

  const categories = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, count: jobs.length },
    { id: 'products', label: 'Products', icon: ShoppingBag, count: products.length },
    { id: 'universities', label: 'Universities', icon: GraduationCap, count: universities.length },
    { id: 'scholarships', label: 'Scholarships', icon: Award, count: scholarships.length }
  ];

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold mb-4">Jobs</h3>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Universities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <UniversityCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'all') {
      return (
        <div className="space-y-12">
          {jobs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                Jobs ({jobs.length})
              </h3>
              <div className="space-y-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                Products ({products.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {universities.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-500" />
                Universities ({universities.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((university) => (
                  <UniversityCard key={university.id} university={university} />
                ))}
              </div>
            </div>
          )}

          {scholarships.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Scholarships ({scholarships.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Filtered results by category
    const filteredResults = {
      jobs: () => (
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ),
      products: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ),
      universities: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>
      ),
      scholarships: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      )
    };

    return filteredResults[activeTab]?.() || <div>No results found.</div>;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Search Results</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {query ? `Showing results for "${query}"` : 'Enter a search term to find what you\'re looking for'}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search anything - jobs, products, universities, scholarships..."
            className="scale-in"
            initialValue={searchQuery}
          />
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    activeTab === category.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                  {category.count !== undefined && category.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {category.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div>
          {renderResults()}
        </div>

        {/* No results message */}
        {!isLoading && !jobs.length && !products.length && !universities.length && !scholarships.length && query && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn't find anything matching "{query}". Try different keywords or browse by category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
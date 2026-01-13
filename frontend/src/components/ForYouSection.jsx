import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from './JobCard';
import ProductCard from './ProductCard';
import UniversityCard from './UniversityCard';
import ScholarshipCard from './ScholarshipCard';
import JobCardSkeleton from './JobCardSkeleton';
import ProductCardSkeleton from './ProductCardSkeleton';
import UniversityCardSkeleton from './UniversityCardSkeleton';

const ForYouSection = ({ type, title, linkTo }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recommendations
    const loadRecommendations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data based on type
      let mockData = [];
      
      if (type === 'jobs') {
        mockData = [
          {
            id: 1,
            title: "Senior React Developer",
            company: "TechFlow Inc",
            logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=200&fit=crop",
            location: "Remote",
            salary: "$130k - $160k",
            experience: "5+ years",
            type: "Full-time",
            posted: "1 day ago",
            description: "Join our team building cutting-edge web applications with React and TypeScript."
          },
          {
            id: 2,
            title: "Frontend Engineer",
            company: "StartupXYZ",
            logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=200&fit=crop",
            location: "San Francisco, CA",
            salary: "$110k - $140k",
            experience: "3+ years",
            type: "Full-time",
            posted: "3 days ago",
            description: "Build beautiful user interfaces for our growing fintech platform."
          },
          {
            id: 3,
            title: "UI/UX Designer",
            company: "DesignCorp",
            logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
            location: "New York, NY",
            salary: "$95k - $125k",
            experience: "4+ years",
            type: "Full-time",
            posted: "5 days ago",
            description: "Design intuitive experiences for millions of users worldwide."
          }
        ];
      } else if (type === 'products') {
        mockData = [
          {
            id: 1,
            name: "MacBook Pro M3",
            brand: "Apple",
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
            price: 1999.99,
            originalPrice: 2199.99,
            rating: "4.9",
            reviews: 342,
            discount: "-9%",
            description: "The most powerful MacBook Pro ever, with the M3 chip for incredible performance."
          },
          {
            id: 2,
            name: "Sony WH-1000XM5",
            brand: "Sony",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
            price: 349.99,
            originalPrice: 399.99,
            rating: "4.7",
            reviews: 289,
            discount: "-13%",
            description: "Industry-leading noise canceling with premium sound quality."
          },
          {
            id: 3,
            name: "iPhone 15 Pro",
            brand: "Apple",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
            price: 999.99,
            originalPrice: 1099.99,
            rating: "4.8",
            reviews: 567,
            discount: "-9%",
            description: "The most advanced iPhone with titanium design and powerful A17 Pro chip."
          }
        ];
      } else if (type === 'universities') {
        mockData = [
          {
            id: 1,
            name: "Stanford University",
            image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=800&h=600&fit=crop",
            location: "Stanford, CA",
            ranking: "#2 in Engineering",
            tuition: "$58,000/year",
            programs: ["Computer Science", "Engineering", "Business", "Medicine"],
            acceptance: "4%"
          },
          {
            id: 2,
            name: "MIT",
            image: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=600&fit=crop",
            location: "Cambridge, MA",
            ranking: "#1 in Technology",
            tuition: "$57,000/year",
            programs: ["AI", "Robotics", "Data Science", "Physics"],
            acceptance: "7%"
          },
          {
            id: 3,
            name: "Harvard University",
            image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&h=600&fit=crop",
            location: "Cambridge, MA",
            ranking: "#1 in Business",
            tuition: "$54,000/year",
            programs: ["Business", "Law", "Medicine", "Liberal Arts"],
            acceptance: "3%"
          }
        ];
      } else if (type === 'scholarships') {
        mockData = [
          {
            id: 1,
            name: "Merit Excellence Scholarship",
            provider: "Stanford University",
            amount: 50000,
            type: "Full Tuition",
            description: "Full tuition scholarship for outstanding academic achievement in STEM fields.",
            level: "Undergraduate",
            location: "Stanford, CA",
            deadline: "March 15, 2024",
            applicants: "2,500",
            fields: ["Engineering", "Computer Science", "Mathematics"],
            difficulty: "Hard"
          },
          {
            id: 2,
            name: "Innovation Grant",
            provider: "Tech Foundation",
            amount: 25000,
            type: "Research Grant",
            description: "Supporting innovative research projects in technology and entrepreneurship.",
            level: "Graduate",
            location: "Nationwide",
            deadline: "April 30, 2024",
            applicants: "1,200",
            fields: ["Technology", "Entrepreneurship", "Innovation"],
            difficulty: "Medium"
          },
          {
            id: 3,
            name: "Diversity in Tech Scholarship",
            provider: "TechCorp Foundation",
            amount: 15000,
            type: "Partial Tuition",
            description: "Supporting underrepresented students pursuing careers in technology.",
            level: "Undergraduate",
            location: "Nationwide",
            deadline: "May 15, 2024",
            applicants: "800",
            fields: ["Computer Science", "Data Science", "Cybersecurity"],
            difficulty: "Easy"
          }
        ];
      }
      
      setItems(mockData);
      setIsLoading(false);
    };

    loadRecommendations();
  }, [type]);

  const renderCard = (item) => {
    if (type === 'jobs') return <JobCard key={item.id} job={item} />;
    if (type === 'products') return <ProductCard key={item.id} product={item} />;
    if (type === 'universities') return <UniversityCard key={item.id} university={item} />;
    if (type === 'scholarships') return <ScholarshipCard key={item.id} scholarship={item} />;
    return null;
  };

  const renderSkeleton = () => {
    if (type === 'jobs') return <JobCardSkeleton />;
    if (type === 'products') return <ProductCardSkeleton />;
    if (type === 'universities') return <UniversityCardSkeleton />;
    if (type === 'scholarships') return <UniversityCardSkeleton />; // Using same skeleton
    return null;
  };

  const getGridClass = () => {
    if (type === 'jobs') return 'space-y-6';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {linkTo && (
          <Link 
            to={linkTo}
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-medium"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className={getGridClass()}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              {renderSkeleton()}
            </div>
          ))}
        </div>
      ) : (
        <div className={getGridClass()}>
          {items.map(renderCard)}
        </div>
      )}
    </div>
  );
};

export default ForYouSection;
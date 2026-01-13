
// This file contains mock API functions that would be replaced with real API calls later

// Mock data for job listings
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    description: "We're looking for an experienced React developer to join our team.",
    posted: "2 days ago",
    logo: "https://randomuser.me/api/portraits/men/1.jpg",
    experience: "5+ years",
    type: "Full-time"
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "DesignHub",
    location: "Remote",
    salary: "$90,000 - $110,000",
    description: "Join our creative team and design beautiful user experiences.",
    posted: "1 week ago",
    logo: "https://randomuser.me/api/portraits/women/2.jpg",
    experience: "3+ years",
    type: "Full-time"
  },
  {
    id: 3,
    title: "Product Manager",
    company: "InnovateCo",
    location: "New York, NY",
    salary: "$130,000 - $160,000",
    description: "Lead our product team and drive innovation.",
    posted: "3 days ago",
    logo: "https://randomuser.me/api/portraits/men/3.jpg",
    experience: "4+ years",
    type: "Full-time"
  },
  {
    id: 4,
    title: "Full Stack Developer",
    company: "WebSolutions",
    location: "Austin, TX",
    salary: "$100,000 - $130,000",
    description: "Build robust web applications from front to back.",
    posted: "Just now",
    logo: "https://randomuser.me/api/portraits/women/4.jpg",
    experience: "3+ years",
    type: "Contract"
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Seattle, WA",
    salary: "$110,000 - $140,000",
    description: "Manage and improve our cloud infrastructure.",
    posted: "5 days ago",
    logo: "https://randomuser.me/api/portraits/men/5.jpg",
    experience: "2+ years",
    type: "Full-time"
  },
  {
    id: 6,
    title: "Data Scientist",
    company: "DataIntel",
    location: "Boston, MA",
    salary: "$120,000 - $150,000",
    description: "Extract insights from our vast datasets.",
    posted: "1 day ago",
    logo: "https://randomuser.me/api/portraits/women/6.jpg",
    experience: "3+ years",
    type: "Full-time"
  }
];

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    brand: "SoundMaster",
    price: 199.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1546435770-a3e42ff0d2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "15% OFF",
    reviews: 1250,
    description: "Immersive sound quality with noise cancellation."
  },
  {
    id: 2,
    name: "Ultra-Thin Laptop",
    brand: "TechPro",
    price: 1299.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "Free Shipping",
    reviews: 872,
    description: "Powerful performance in a sleek design."
  },
  {
    id: 3,
    name: "Smart Watch Series 5",
    brand: "FitTech",
    price: 299.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "20% OFF",
    reviews: 1534,
    description: "Track your health and stay connected."
  },
  {
    id: 4,
    name: "Professional DSLR Camera",
    brand: "PixelPro",
    price: 1499.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "Free Lens Kit",
    reviews: 968,
    description: "Capture stunning photos and videos."
  },
  {
    id: 5,
    name: "Ergonomic Office Chair",
    brand: "ComfortPlus",
    price: 249.99,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1505843490701-5be5c42ba9fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "30% OFF",
    reviews: 731,
    description: "Premium comfort for long work hours."
  },
  {
    id: 6,
    name: "Smart Home Security System",
    brand: "SecureHome",
    price: 399.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1558002038-1055e2fae2c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    discount: "Free Installation",
    reviews: 593,
    description: "Protect your home with smart technology."
  }
];

// Mock data for universities
const MOCK_UNIVERSITIES = [
  {
    id: 1,
    name: "Stanford University",
    location: "Stanford, CA",
    ranking: "#4 National",
    tuition: "$56,169",
    image: "https://images.unsplash.com/photo-1580625858819-1ffdbe2c861c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Computer Science", "Engineering", "Business"],
    acceptance: "4.3%"
  },
  {
    id: 2,
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    ranking: "#2 National",
    tuition: "$57,590",
    image: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Engineering", "Physics", "Economics"],
    acceptance: "6.7%"
  },
  {
    id: 3,
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    ranking: "#22 National",
    tuition: "$45,036 (out-of-state)",
    image: "https://images.unsplash.com/photo-1616502570434-7ebafa5f7331?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Computer Science", "Business", "Psychology"],
    acceptance: "16.3%"
  },
  {
    id: 4,
    name: "Harvard University",
    location: "Cambridge, MA",
    ranking: "#3 National",
    tuition: "$54,768",
    image: "https://images.unsplash.com/photo-1559135197-8a45e6ae2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Law", "Business", "Medicine"],
    acceptance: "4.6%"
  },
  {
    id: 5,
    name: "University of Oxford",
    location: "Oxford, UK",
    ranking: "#5 Global",
    tuition: "£28,950 (International)",
    image: "https://images.unsplash.com/photo-1580716936308-bb46c811eed2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Philosophy", "Physics", "Economics"],
    acceptance: "17.5%"
  },
  {
    id: 6,
    name: "University of Tokyo",
    location: "Tokyo, Japan",
    ranking: "#23 Global",
    tuition: "¥802,500 (Undergraduate)",
    image: "https://images.unsplash.com/photo-1594311270575-1ad24b62a91e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    programs: ["Engineering", "Science", "Medicine"],
    acceptance: "33.1%"
  }
];

// Mock API functions
export const fetchJobs = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredJobs = [...MOCK_JOBS];
      
      // Apply filters if any
      if (filters.title) {
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(filters.title.toLowerCase())
        );
      }
      
      if (filters.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.experience) {
        filteredJobs = filteredJobs.filter(job => {
          const years = parseInt(job.experience);
          const filterYears = parseInt(filters.experience);
          return years >= filterYears;
        });
      }

      resolve(filteredJobs);
    }, 800); // Simulate network delay
  });
};

export const fetchProducts = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredProducts = [...MOCK_PRODUCTS];
      
      // Apply filters if any
      if (filters.name) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(filters.name.toLowerCase()) || 
          product.brand.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      
      if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= filters.minPrice
        );
      }
      
      if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= filters.maxPrice
        );
      }

      resolve(filteredProducts);
    }, 800); // Simulate network delay
  });
};

export const fetchUniversities = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredUniversities = [...MOCK_UNIVERSITIES];
      
      // Apply filters if any
      if (filters.name) {
        filteredUniversities = filteredUniversities.filter(university => 
          university.name.toLowerCase().includes(filters.name.toLowerCase()) ||
          university.programs.some(program => program.toLowerCase().includes(filters.name.toLowerCase()))
        );
      }
      
      if (filters.location) {
        filteredUniversities = filteredUniversities.filter(university => 
          university.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      resolve(filteredUniversities);
    }, 800); // Simulate network delay
  });
};

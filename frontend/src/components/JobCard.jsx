import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, DollarSign, Building } from 'lucide-react';

// Move the logo generation function here
const generateCompanyLogo = (companyName) => {
  if (!companyName) {
    return (
      <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
        CO
      </div>
    );
  }

  // Remove special characters and get first two letters for avatar
  const cleanName = companyName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Color palette for consistent avatar backgrounds
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  // Generate consistent color based on company name
  const colorIndex = cleanName.length % colors.length;
  
  return (
    <div className={`w-12 h-12 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
      {initials || 'CO'}
    </div>
  );
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to job details with the job data
    navigate(`/jobs/${job.id}`, { state: { job } });
  };

  // Extract company name from the company field
  const extractCompanyName = (companyField) => {
    if (!companyField) return 'Company not specified';
    // Split by newlines and take the first part as company name
    return companyField.split('\n')[0];
  };

  // Extract location from company field or use location field
  const extractLocation = () => {
    if (job.location && job.location.trim() !== '') {
      return job.location;
    }
    
    if (job.company) {
      const parts = job.company.split('\n');
      if (parts.length > 1) {
        return parts[1]; // Second line usually contains location
      }
    }
    
    return 'Location not specified';
  };

  // Format job type from company field
  const extractJobType = () => {
    if (job.jobType) return job.jobType;
    
    if (job.company) {
      const parts = job.company.split('\n');
      if (parts.length > 2) {
        return parts[2]; // Third line usually contains job type
      }
    }
    
    return job.type || 'Not specified';
  };

  const companyName = job.companyName || extractCompanyName(job.company);

  return (
    <div className="block">
      <div className="glass-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] stagger-item">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {generateCompanyLogo(companyName)}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {job.title || 'Job Title Not Specified'}
              </h3>
              <span className="text-sm text-blue-500 dark:text-blue-400 font-medium">
                {job.posted || 'Recent'}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building className="w-4 h-4" />
                {companyName}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{extractLocation()}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>{job.salary || 'Salary not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{job.experience || 'Experience not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{extractJobType()}</span>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {job.description || 'No description available'}
            </p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={handleViewDetails}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-md"
              >
                View Details
              </button>
              
              {job.url && (
                <button
                  onClick={() => window.open(job.url, "_blank")}
                  className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
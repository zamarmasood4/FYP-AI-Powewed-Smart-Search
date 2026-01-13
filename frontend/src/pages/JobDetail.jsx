import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Clock, Briefcase, DollarSign, ArrowLeft, ExternalLink, Building, Globe } from 'lucide-react';

// Logo generation function for JobDetail
const generateCompanyLogo = (companyName, size = 'large') => {
  if (!companyName) {
    const className = size === 'large' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-sm';
    return (
      <div className={`${className} bg-gray-400 rounded-xl flex items-center justify-center text-white font-bold`}>
        CO
      </div>
    );
  }

  const cleanName = companyName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const initials = cleanName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const colorIndex = cleanName.length % colors.length;
  const className = size === 'large' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-sm';
  
  return (
    <div className={`${className} ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-bold`}>
      {initials || 'CO'}
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const job = location.state?.job;

  // Helper functions to parse the company field
  const extractCompanyName = (companyField) => {
    if (!companyField) return 'Company not specified';
    return companyField.split('\n')[0];
  };

  const extractLocationFromCompany = () => {
    if (job?.location && job.location.trim() !== '') {
      return job.location;
    }
    
    if (job?.company) {
      const parts = job.company.split('\n');
      if (parts.length > 1) {
        return parts[1];
      }
    }
    
    return 'Location not specified';
  };

  const extractJobTypeFromCompany = () => {
    if (job?.jobType) return job.jobType;
    
    if (job?.company) {
      const parts = job.company.split('\n');
      if (parts.length > 2) {
        return parts[2];
      }
    }
    
    return job?.type || 'Not specified';
  };

  const renderField = (value, label, icon = null) => {
    const displayValue = value || "Not specified";
    const isNotSpecified = !value || value.toLowerCase().includes('not specified');
    
    return (
      <div className={`flex items-center gap-2 ${isNotSpecified ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
        {icon && React.cloneElement(icon, { className: "w-4 h-4" })}
        <span className="font-medium">{label}:</span>
        <span className={isNotSpecified ? 'italic' : ''}>{displayValue}</span>
      </div>
    );
  };

  // If no job data is available
  if (!job) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
          
          <div className="glass-card p-8 text-center rounded-xl">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Job Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The job details you're looking for are not available.
            </p>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Back to Job Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const companyName = job.companyName || extractCompanyName(job.company);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        <div className="glass-card rounded-xl overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {generateCompanyLogo(companyName, 'large')}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title || "Job Title Not Specified"}
                </h1>
                
                <div className="text-xl text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {companyName}
                </div>
                
                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                  {renderField(extractLocationFromCompany(), "Location", <MapPin />)}
                  {renderField(job.salary, "Salary", <DollarSign />)}
                  {renderField(job.experience, "Experience", <Briefcase />)}
                  {renderField(extractJobTypeFromCompany(), "Job Type", <Clock />)}
                  {renderField(job.posted, "Posted", <Clock />)}
                  {renderField(job.source, "Source", <Globe />)}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {job.url ? (
                  <button
                    onClick={() => window.open(job.url, "_blank")}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-md"
                  >
                    Apply on {job.source || "Company Website"}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-400 text-white rounded-full cursor-not-allowed"
                  >
                    Apply Link Not Available
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Job Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Job Description</h3>
              {job.description ? (
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 italic">
                    Detailed job description not available in our system. 
                    Please click "Apply on {job.source || 'Company Website'}" to view the complete job description 
                    and requirements on the official posting.
                  </p>
                </div>
              )}
            </div>
            
            {/* Job ID and Source Information */}
            {/* <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Job Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Job ID:</span>
                  <span className="text-gray-600 dark:text-gray-400 font-mono">{job.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Source:</span>
                  <span className="text-gray-600 dark:text-gray-400">{job.source}</span>
                </div>
              </div>
            </div> */}
            
            {/* Application CTA */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Ready to Apply?
                </h4>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  {job.url ? (
                    <>Click the button above to be redirected to the official application page on {job.source}.</>
                  ) : (
                    <>This job posting doesn't have a direct application link. Please visit {companyName}'s career page to apply.</>
                  )}
                </p>
                
                {job.url && (
                  <button
                    onClick={() => window.open(job.url, "_blank")}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    Apply Now on {job.source}
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
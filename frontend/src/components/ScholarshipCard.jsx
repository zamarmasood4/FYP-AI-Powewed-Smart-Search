import React from 'react';
import { 
  GraduationCap, 
  MapPin, 
  DollarSign, 
  Building,
  ExternalLink,
  ArrowRight,
  Clock
} from 'lucide-react';

const ScholarshipCard = ({ scholarship }) => {
  // Safe data access
  const title = scholarship?.title || scholarship?.name || 'Scholarship Name';
  const location = scholarship?.location || 'Location N/A';
  const amount = scholarship?.amount || 'Amount Varies';
  const sponsor = scholarship?.sponsor || 'Sponsor';
  const url = scholarship?.url || '#';
  const deadline = scholarship?.deadline || 'Varies';
  const studyLevel = scholarship?.studyLevel || 'All Levels';
  
  // Parse deadline status with consistent color themes
  const getDeadlineInfo = (dateStr) => {
    if (!dateStr || dateStr === 'Varies') {
      return { 
        label: 'Open', 
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
      };
    }
    
    const today = new Date();
    const deadlineDate = new Date(dateStr);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { 
      label: 'Expired', 
      dotColor: 'bg-gray-400',
      textColor: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    };
    
    if (diffDays <= 14) return { 
      label: `${diffDays} Days Left`, 
      dotColor: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20'
    };
    
    if (diffDays <= 30) return { 
      label: 'Closing Soon', 
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    };

    return { 
      label: 'Open', 
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    };
  };

  const status = getDeadlineInfo(deadline);

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden hover:-translate-y-1 cursor-pointer ${
        !url || url === '#' ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {/* Premium Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex flex-col h-full relative z-10">
        
        {/* Top Section */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            {/* Sponsor Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <Building className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider max-w-[120px] truncate">
                {sponsor}
              </span>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border border-transparent ${status.bgColor} ${status.textColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />
              {status.label}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </div>

        {/* Value Proposition (Middle) */}
        <div className="px-6 py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-between group-hover:scale-[1.02] transition-transform duration-300 origin-left">
            <div>
              <p className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-widest mb-0.5">Award Amount</p>
              <div className="flex items-baseline gap-1 text-blue-700 dark:text-blue-100">
                <span className="text-2xl font-extrabold tracking-tight">{amount}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-blue-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Details Grid (Bottom) */}
        <div className="p-6 pt-4 flex-1 flex flex-col">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 group/item">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-purple-50 dark:group-hover/item:bg-purple-900/20 transition-colors">
                <GraduationCap className="w-4 h-4 text-purple-500" />
              </div>
              <span className="font-medium truncate">{studyLevel}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 group/item">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-red-50 dark:group-hover/item:bg-red-900/20 transition-colors">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <span className="font-medium truncate">{location}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 group/item">
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-orange-50 dark:group-hover/item:bg-orange-900/20 transition-colors">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-medium truncate">
                Deadline: <span className={status.textColor}>{deadline === 'Varies' ? 'Rolling' : new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleApplyClick}
              className={`flex-1 py-3 ${
                !url || url === '#' 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-gray-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-400'
              } text-white dark:text-gray-900 dark:hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group/btn`}
              disabled={!url || url === '#'}
            >
              {!url || url === '#' ? 'No Link Available' : 'Apply Now'}
              {(!url || url === '#') ? null : <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />}
            </button>
            <div className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipCard;
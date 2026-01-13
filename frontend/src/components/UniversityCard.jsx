import React from 'react';
import { MapPin, Trophy, ExternalLink, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

const UniversityCard = ({ university }) => {
  // Safe data access
  const title = university?.title || university?.name || 'University Name Not Available';
  const location = university?.location || 'Location Not Available';
  const ranking = university?.ranking || 'N/A';
  const url = university?.url || '#';
  const image = university?.image;
  const studyLevel = university?.studyLevel || 'Program Level Not Specified';
  
  // Safe array access
  const fields = Array.isArray(university?.fields) ? university.fields : [];
  
  // Calculate acceptance rate
  const acceptance = university?.acceptance || 'Varies';

  // Generate a consistent color based on university name
  const getUniversityColor = (name) => {
    const colors = [
      'bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 
      'bg-rose-600', 'bg-amber-600', 'bg-indigo-600',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

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
      className={`group h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-violet-300 dark:hover:border-violet-800 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
        !url || url === '#' ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {/* Header Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900 group-hover:opacity-95 transition-opacity">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback Avatar */}
        <div className={`absolute inset-0 flex items-center justify-center ${image ? 'hidden' : 'flex'} ${getUniversityColor(title)} bg-opacity-10 dark:bg-opacity-20`}>
           <div className={`w-20 h-20 rounded-full ${getUniversityColor(title)} flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white/20`}>
              {getInitials(title)}
           </div>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        {/* Ranking Badge */}
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 border border-gray-100 dark:border-gray-700">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">#{ranking}</span>
        </div>
        
        {/* Level Badge */}
        <div className="absolute bottom-4 left-4">
           <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md border border-white/20">
            <GraduationCap className="w-3.5 h-3.5" />
            {studyLevel}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title & Location */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span className="line-clamp-1 font-medium">{location}</span>
          </div>
        </div>

        {/* Tags / Fields */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {fields.slice(0, 3).map((field, idx) => (
              <span key={idx} className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                {field}
              </span>
            ))}
            {fields.length > 3 && (
              <span className="text-[10px] font-medium text-gray-400 px-1 py-1">
                +{fields.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Footer Stats & Action */}
        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-0.5">Acceptance</span>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              {acceptance}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Apply Now Button */}
            <button
              onClick={handleApplyClick}
              className={`px-3 py-2 ${
                !url || url === '#' 
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700'
              } text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/20 flex items-center gap-1.5 group/btn z-10`}
              disabled={!url || url === '#'}
            >
              {!url || url === '#' ? 'No Link' : 'Apply'}
              {(!url || url === '#') ? null : <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />}
            </button>
            
            {/* Arrow Icon (Visual cue only, since whole card is clickable) */}
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;
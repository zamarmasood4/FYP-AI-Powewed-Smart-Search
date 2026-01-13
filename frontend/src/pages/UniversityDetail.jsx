import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Trophy, DollarSign, CheckCircle, Book, GraduationCap, ArrowLeft, Users, Clock, Briefcase, Globe, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extended data for demo universities to ensure the detail page looks rich
  // even if the search result cache only had basic info.
  const demoDataEnrichment = {
    1: {
      statistics: {
        studentBody: "11,520",
        facultyRatio: "1:3",
        employmentRate: "94%",
        internationalStudents: "33%"
      },
      facilities: [
        "MIT Media Lab", "Schwarzman College of Computing", "Hayden Library", "Z-Center Sports Complex"
      ],
      description: "The Massachusetts Institute of Technology (MIT) is a private land-grant research university in Cambridge, Massachusetts. Established in 1861, MIT has played a key role in the development of modern technology and science."
    },
    2: {
      statistics: {
        studentBody: "17,326",
        facultyRatio: "1:5",
        employmentRate: "96%",
        internationalStudents: "24%"
      },
      facilities: [
        "Green Library", "SLAC National Accelerator", "Cantor Arts Center", "Arrillaga Recreation Center"
      ],
      description: "Stanford University is a private research university in Stanford, California. It is known for its academic strength, wealth, proximity to Silicon Valley, and ranking as one of the world's top universities."
    }
  };

  useEffect(() => {
    const loadUniversity = () => {
      try {
        let foundUni = null;

        // 1. Try to find in current search results (most recent data)
        const currentData = localStorage.getItem('currentUniversitySearchData');
        if (currentData) {
          const { universities } = JSON.parse(currentData);
          foundUni = universities.find(u => u.id == id);
        }

        // 2. If not found, check the main cache
        if (!foundUni) {
          const cache = localStorage.getItem('universitySearchCache');
          if (cache) {
            const parsedCache = JSON.parse(cache);
            // Iterate through map entries [key, value]
            for (const [key, results] of parsedCache) {
              const found = results.find(u => u.id == id);
              if (found) {
                foundUni = found;
                break;
              }
            }
          }
        }

        // 3. Fallback for demo IDs if absolutely nothing is found in cache (Deep Linking/Refresh support)
        if (!foundUni) {
           if (id == 1) {
             foundUni = {
              id: 1,
              title: "Massachusetts Institute of Technology",
              location: "Cambridge, Massachusetts",
              ranking: "1",
              url: "https://www.mit.edu",
              type: "university",
              studyLevel: "PhD Programs",
              field: "Science",
              fields: ["Computer Science", "Engineering", "Physics"],
              programs: [],
              acceptance: "7%"
             };
           } else if (id == 2) {
             foundUni = {
              id: 2,
              title: "Stanford University",
              location: "Stanford, California",
              ranking: "2",
              url: "https://www.stanford.edu",
              type: "university",
              studyLevel: "PhD Programs",
              field: "Business",
              fields: ["Business", "Medicine", "Law"],
              programs: [],
              acceptance: "4%"
             };
           }
        }

        if (foundUni) {
          // Enrich data if it's a known demo ID
          const enrichment = demoDataEnrichment[foundUni.id] || {};

          // Normalize data to ensure all UI fields exist
          setUniversity({
            ...foundUni,
            description: enrichment.description || foundUni.description || "No description available.",
            // Ensure nested objects exist to prevent crashes
            statistics: enrichment.statistics || foundUni.statistics || {
              studentBody: "N/A",
              facultyRatio: "N/A",
              employmentRate: "N/A",
              internationalStudents: "N/A"
            },
            facilities: enrichment.facilities || foundUni.facilities || [
              "Library", "Research Labs", "Student Center", "Sports Complex"
            ],
            programs: foundUni.programs || [],
            fields: foundUni.fields || []
          });
        }
      } catch (error) {
        console.error("Error loading university details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUniversity();
  }, [id]);

  // Color generator for fallback header
  const getUniversityColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-600 to-indigo-900',
      'bg-gradient-to-br from-violet-600 to-purple-900',
      'bg-gradient-to-br from-emerald-600 to-teal-900',
      'bg-gradient-to-br from-rose-600 to-red-900',
    ];
    if (!name) return colors[0];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">University not found</h2>
        <Button onClick={() => navigate('/universities')} className="bg-violet-500 hover:bg-violet-600 text-white">
          Back to Search
        </Button>
      </div>
    );
  }

  const colorClass = getUniversityColor(university.title);
  const initials = getInitials(university.title);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Button>

        {/* University Header */}
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[21/9] md:aspect-[3/1] bg-gray-100 dark:bg-gray-800 relative shadow-xl">
          {university.image ? (
            <img 
              src={university.image} 
              alt={university.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          
          {/* Fallback Header Background */}
          <div className={`w-full h-full flex items-center justify-center text-white/20 text-9xl font-bold ${colorClass} ${university.image ? 'hidden' : 'flex'}`}>
            {initials}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 shadow-sm">{university.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90 font-medium">
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4" />
                    <span>{university.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Ranked #{university.ranking}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Acceptance: {university.acceptance}</span>
                  </div>
                </div>
              </div>
              
              {university.url && (
                <a 
                  href={university.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-8">
                  {university.description}
                </p>
                
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 text-center">
                    <Users className="w-6 h-6 mx-auto text-violet-500 mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{university.statistics.studentBody}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Students</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-center">
                    <Book className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{university.statistics.facultyRatio}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Faculty Ratio</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 text-center">
                    <Briefcase className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{university.statistics.employmentRate}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Employment</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 text-center">
                    <Globe className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{university.statistics.internationalStudents}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Global</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  Campus Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {university.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{facility}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card className="glass-card border-none shadow-lg h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  Top Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {university.programs.length > 0 ? university.programs.map((program, index) => (
                    <div key={index} className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-default">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                             <Book className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{program.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 pl-11">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{program.type}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 italic">No specific program details available.</p>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Fields of Study</h4>
                  <div className="flex flex-wrap gap-2">
                    {university.fields.map((field, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetail;
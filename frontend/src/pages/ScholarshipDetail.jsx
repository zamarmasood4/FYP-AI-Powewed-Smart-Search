import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Building,
  Target,
  CheckCircle,
  FileText,
  Award,
  Share2,
  Bookmark,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scholarship, setScholarship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback demo data logic
  const getDemoScholarship = (id) => {
    return {
      id: id,
      title: "AAUW International Fellowships in USA for Women",
      location: "United States of America",
      description: "International Fellowships have been in existence since 1917. The program provides support for women pursuing full-time graduate or postdoctoral study in the United States to women who are not U.S. citizens or permanent residents.",
      url: "https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/",
      type: "scholarship",
      source: "AAUW",
      studyLevel: "Masters, PhD, Postdoctoral",
      field: "All Fields",
      fields: ["Science", "Arts", "Engineering", "Humanities"],
      programs: [
        { name: "Master's Degree", duration: "1-2 Years", type: "Full-time", level: "Graduate" },
        { name: "Doctoral Degree", duration: "3-5 Years", type: "Full-time", level: "PhD" }
      ],
      amount: "$18,000 - $50,000",
      sponsor: "American Association of University Women",
      deadline: "2024-11-15",
      eligibility: [
        "Women applicants only",
        "Non-U.S. citizens or permanent residents",
        "Hold academic degree equivalent to U.S. bachelor's degree",
        "Proficiency in English"
      ],
      benefits: [
        "Master's/Professional Fellowship: $20,000",
        "Doctorate Fellowship: $25,000",
        "Postdoctoral Fellowship: $50,000"
      ],
      applicationProcess: [
        { step: 1, title: "Eligibility Check", description: "Verify you meet all criteria before starting." },
        { step: 2, title: "Online Application", description: "Complete the form and upload documents.", deadline: "Nov 15" },
        { step: 3, title: "Recommendations", description: "Submit 3 letters of recommendation." }
      ],
      requirements: [
        "Official Transcripts",
        "Proof of English Proficiency (TOEFL/IELTS)",
        "CV/Resume",
        "Personal Statement"
      ],
      contact: {
        email: "connect@aauw.org",
        website: "https://www.aauw.org",
        phone: "+1 (202) 785-7700"
      }
    };
  };

  useEffect(() => {
    const loadScholarship = () => {
      try {
        let foundItem = null;

        // 1. Try finding in current search results
        const currentData = localStorage.getItem('currentUniversitySearchData');
        if (currentData) {
          const { scholarships } = JSON.parse(currentData);
          foundItem = scholarships.find(s => s.id == id);
        }

        // 2. Try finding in the main cache
        if (!foundItem) {
          const cache = localStorage.getItem('universitySearchCache');
          if (cache) {
            const parsedCache = JSON.parse(cache);
            for (const [key, results] of parsedCache) {
              const found = results.find(s => s.id == id);
              if (found) {
                foundItem = found;
                break;
              }
            }
          }
        }

        // 3. Fallback for demo ID
        if (!foundItem) {
           foundItem = getDemoScholarship(id);
        }

        if (foundItem) {
          setScholarship({
            ...foundItem,
            amount: foundItem.amount || "Varies",
            sponsor: foundItem.sponsor || foundItem.source || "External Organization",
            deadline: foundItem.deadline || "Open",
            eligibility: foundItem.eligibility || ["Check official website for eligibility requirements."],
            benefits: foundItem.benefits || ["Tuition coverage", "Stipend availability varies"],
            requirements: foundItem.requirements || ["Application form", "Transcripts"],
            applicationProcess: foundItem.applicationProcess || [
              { step: 1, title: "Apply Online", description: "Visit the official website to start your application." }
            ],
            contact: foundItem.contact || { website: foundItem.url },
            fields: foundItem.fields || [foundItem.field] || [],
            programs: foundItem.programs || []
          });
        }
      } catch (error) {
        console.error("Error loading scholarship:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScholarship();
  }, [id]);

  const getDeadlineStatus = (deadline) => {
    if (!deadline || deadline === 'Varies' || deadline === 'Open') {
      return { text: 'Open', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    }
    
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
      if (diffDays <= 30) return { text: `${diffDays} Days Left`, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
      return { text: 'Open', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    } catch {
      return { text: 'Open', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold mb-4">Scholarship not found</div>
        <Button onClick={() => navigate('/universities')}>Back to Search</Button>
      </div>
    );
  }

  const deadlineInfo = getDeadlineStatus(scholarship.deadline);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-amber-200/20 dark:bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-200/20 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 pl-0 hover:pl-2 transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-transparent"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Results</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/50">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                        {deadlineInfo.text}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {scholarship.type}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 font-serif tracking-tight">
                      {scholarship.title}
                    </h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-500" />
                        {scholarship.sponsor}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {scholarship.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Value Badge */}
                  <div className="hidden md:block flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                      {scholarship.amount}
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <p className="leading-relaxed">{scholarship.description}</p>
                </div>
              </div>
            </div>

            {/* Premium Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirements Card */}
              <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {scholarship.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Eligibility Card */}
              <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {scholarship.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 group">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-purple-100 dark:border-purple-900 flex items-center justify-center flex-shrink-0 group-hover:border-purple-500 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/10 dark:to-gray-900 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold relative z-10">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                  Scholarship Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scholarship.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-amber-100 dark:border-amber-900/30 shadow-sm">
                      <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* CTA Card */}
            <Card className="rounded-3xl border-none shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 overflow-hidden sticky top-24">
              {/* Abstract Patterns */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-black/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 dark:bg-black/5 rounded-full -ml-16 -mb-16" />
              
              <CardContent className="p-8 relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-black/5 backdrop-blur-md flex items-center justify-center border border-white/20 dark:border-black/10">
                    <Target className="w-8 h-8" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-2">Apply Today</h3>
                <p className="text-center text-white/70 dark:text-gray-600 text-sm mb-8">
                  Deadline: <span className="font-bold text-white dark:text-gray-900">{scholarship.deadline}</span>
                </p>

                <a 
                  href={scholarship.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl font-bold text-center hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg mb-4"
                >
                  Start Application <ExternalLink className="w-4 h-4 inline ml-2" />
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-white/20 hover:bg-white/10 text-white dark:border-gray-200 dark:text-gray-700 dark:hover:bg-gray-100"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white/20 hover:bg-white/10 text-white dark:border-gray-200 dark:text-gray-700 dark:hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Application Timeline */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-8 pl-2">
                  <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-gray-100 dark:bg-gray-800" />
                  
                  {scholarship.applicationProcess.map((step, index) => (
                    <div key={index} className="relative flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-4 border-gray-50 dark:border-gray-800 shadow-sm flex items-center justify-center z-10 group-hover:border-blue-50 dark:group-hover:border-blue-900/50 transition-colors">
                        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500">{step.step || index + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                        {step.deadline && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> {step.deadline}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white">Contact Info</h4>
                {scholarship.contact.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold">@</span>
                    </div>
                    {scholarship.contact.email}
                  </div>
                )}
                {scholarship.contact.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                      <Globe className="w-4 h-4 text-blue-500" />
                    </div>
                    <a href={scholarship.contact.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                      Official Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;
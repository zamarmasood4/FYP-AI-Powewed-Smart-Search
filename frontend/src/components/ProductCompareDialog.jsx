import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Sparkles, AlertCircle, Trophy } from 'lucide-react';

const ProductCompareDialog = ({ isOpen, onClose, products = [] }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen && products.length > 0) {
      generateComparison();
    } else {
      setComparisonData(null);
      setError('');
    }
  }, [isOpen, products]);

  const generateComparison = async () => {
    if (products.length < 1) return;

    setLoading(true);
    setError('');

    try {
      // API Key provided
      const apiKey = "AIzaSyDAqOzI2Sx55tWXiYr7URw7I4uLYl_t2nU"; 
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      // Prepare product data for the prompt (stripping unnecessary UI fields)
      const productsForAi = products.map(p => ({
        name: p.name || p.title || "Unknown Product",
        price: p.price,
        rating: p.rating,
        brand: p.brand || p.source
      }));

      // Updated prompt to ask for a Verdict/Better product
      const prompt = `
        Act as a shopping assistant. Compare these products and determine which is the best option.
        
        Products: ${JSON.stringify(productsForAi)}

        Return strictly valid JSON with this schema:
        {
          "criteria": ["Price", "Rating", "Pros", "Cons", "Value Score", "Best For", "Verdict"],
          "data": {
            "${productsForAi[0].name}": ["$X", "X.X", "Pro1, Pro2", "Con1", "8/10", "Usage", "Winner - Best Overall"],
            ...
          }
        }
        
        Rules:
        1. Keys in "data" must match product names exactly.
        2. Values must be arrays matching "criteria" order.
        3. Do NOT include product descriptions.
        4. Keep Pros/Cons concise (max 4 words).
        5. "Verdict": explicitly state if it is the "Winner", "Best Budget", etc.
      `;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      let textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) throw new Error("No response from AI");

      // CRITICAL FIX: Clean markdown formatting which often breaks JSON.parse
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(textResponse);
      setComparisonData(parsedData);
    } catch (err) {
      console.error("AI Comparison Error:", err);
      setError('Failed to generate comparison. Please check your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSite = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl scale-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI Product Comparison
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-emerald-600 dark:text-emerald-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-20">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium animate-pulse">Analyzing products with AI...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
              <button 
                onClick={generateComparison}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : comparisonData ? (
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 w-1/4 sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comparison Criteria</span>
                    </th>
                    {/* Render Product Headers (Images & Names) */}
                    {products.map((product, idx) => (
                      <th key={idx} className="p-4 min-w-[220px]">
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                              onError={(e) => { e.target.src = '/api/placeholder/100/100'; }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight px-2">
                              {product.name || product.title}
                            </div>
                            <button
                              onClick={() => handleVisitSite(product.url)}
                              className="text-[10px] font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            >
                              Visit Store
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Render Rows based on Criteria */}
                  {comparisonData.criteria.map((criteria, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 sticky left-0 border-r border-gray-100 dark:border-gray-800 group-hover:bg-gray-50/50 dark:group-hover:bg-gray-800/30">
                        {criteria}
                      </td>
                      {products.map((product, colIndex) => {
                        const productName = product.name || product.title;
                        // Robust lookup that handles exact match or index fallback
                        const productValues = comparisonData.data[productName];
                        const value = productValues 
                          ? productValues[rowIndex] 
                          : Object.values(comparisonData.data)[colIndex]?.[rowIndex] || '-';

                        const isPros = criteria.toLowerCase().includes('pros');
                        const isCons = criteria.toLowerCase().includes('cons');
                        const isVerdict = criteria.toLowerCase().includes('verdict');

                        return (
                          <td key={colIndex} className="p-4 text-sm text-gray-600 dark:text-gray-400 align-top">
                            {isPros ? (
                              <div className="flex flex-wrap gap-1">
                                {value.split(',').map((v, i) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50">
                                    <Sparkles className="w-3 h-3 mr-1" /> {v.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : isCons ? (
                              <span className="text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                {value}
                              </span>
                            ) : isVerdict ? (
                               <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                 <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                 {value}
                               </div>
                            ) : (
                              <span className="font-medium">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors font-medium"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCompareDialog;
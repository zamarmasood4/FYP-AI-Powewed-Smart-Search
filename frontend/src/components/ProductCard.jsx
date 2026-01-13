import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ExternalLink, BarChart3, Check, Loader2 } from 'lucide-react';

const ProductCard = ({ product, isSelected, onSelect, showVisitSiteButton = true, userId, onTrackVisit }) => {
  const [isTracking, setIsTracking] = useState(false);
  const navigate = useNavigate();
  
  // Safe Price Formatter
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numPrice || 0);
  };

  // Function to track product visit
  const trackProductVisit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTracking(true);
    
    try {
      // If onTrackVisit prop is provided, use it
      if (onTrackVisit && userId) {
        await onTrackVisit(userId, product);
      } else {
        // Otherwise use the API endpoint directly
        await trackProductVisitToAPI();
      }
      
      // Open the product URL
      if (product.url) {
        window.open(product.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking product visit:', error);
      // Still open the URL even if tracking fails
      if (product.url) {
        window.open(product.url, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setIsTracking(false);
    }
  };

  // API call to track product visit
  const trackProductVisitToAPI = async () => {
    if (!userId) return;
    
    const response = await fetch('/api/track-product-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        product: {
          id: product.id,
          title: product.title || product.name,
          price: product.price,
          numericPrice: product.numericPrice,
          currency: product.currency,
          url: product.url,
          image: product.image,
          source: product.source,
          rating: product.rating,
          reviews: product.reviews,
          searchQuery: product.searchQuery
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to track product visit');
    }
    
    return await response.json();
  };

  const handleSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) onSelect();
  };

  // Handle card click (navigate to product detail)
  const handleCardClick = (e) => {
    // Only navigate if not clicking on buttons
    if (!e.target.closest('button')) {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div 
      className={`group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer
      ${isSelected 
        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl hover:-translate-y-1'
      }`}
      onClick={handleCardClick}
    >
      {/* Clickable Area */}
      <div className="flex flex-col h-full">
        
        {/* Image Container - Fixed Height */}
        <div className="relative h-60 w-full overflow-hidden bg-gray-50 dark:bg-gray-900 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
          <img 
            src={product.image} 
            alt={product.name || product.title} 
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 mix-blend-multiply dark:mix-blend-normal"
            onError={(e) => { e.target.src = '/api/placeholder/400/300'; }}
          />
          
          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
            {product.discount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                {product.discount}
              </span>
            )}
          </div>

          {/* Compare Toggle Button - Top Right (Replaces Heart) */}
          {onSelect && (
            <button 
              onClick={handleSelect}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md shadow-sm flex items-center justify-center transition-all duration-200 z-10 border ${
                isSelected 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30' 
                  : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-emerald-600 hover:border-emerald-200'
              }`}
              title={isSelected ? "Remove from comparison" : "Add to compare"}
            >
              {isSelected ? <Check className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-4">
          {/* Brand/Category */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-sm">
              {product.brand || product.source || 'Product'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {product.rating || '4.5'}
              </span>
            </div>
          </div>

          {/* Title - Fixed height via line-clamp */}
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name || product.title}
          </h3>

          {/* Description (Optional) */}
          {product.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Spacer to push Price to bottom */}
          <div className="flex-1"></div>

          {/* Price Section */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-medium">Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice !== product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.numericPrice && product.currency && (
                <span className="text-[10px] text-gray-500 mt-0.5">
                  ({product.currency} {product.numericPrice.toFixed(2)})
                </span>
              )}
            </div>

            {/* Visit Site Button */}
            {showVisitSiteButton && product.url && (
              <button 
                onClick={trackProductVisit}
                disabled={isTracking}
                className={`group/btn relative px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-semibold hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isTracking ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Tracking...
                  </>
                ) : (
                  <>
                    Buy Now
                    <ExternalLink className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
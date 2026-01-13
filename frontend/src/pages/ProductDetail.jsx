import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Package, Shield, Truck, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe Price Formatter
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numPrice || 0);
  };

  useEffect(() => {
    const loadProduct = () => {
      try {
        // Try to get from current search results first (most likely source)
        const savedState = localStorage.getItem('currentProductsData');
        let foundProduct = null;

        if (savedState) {
          const { products } = JSON.parse(savedState);
          // Compare as string/number to be safe
          foundProduct = products.find(p => p.id == id);
        }

        // If not found in current search, check the cache
        if (!foundProduct) {
          const cache = localStorage.getItem('productSearchCache');
          if (cache) {
            const parsedCache = JSON.parse(cache);
            // Cache is a Map serialized as an array of entries
            for (const [key, results] of parsedCache) {
              const found = results.find(p => p.id == id);
              if (found) {
                foundProduct = found;
                break;
              }
            }
          }
        }

        // Fallback for demo purposes if ID=1 (so at least one product works even if cache is empty)
        if (!foundProduct && id == 1) {
           foundProduct = {
            id: 1,
            name: "Premium Wireless Headphones",
            brand: "AudioTech",
            price: 299.99,
            originalPrice: 399.99,
            description: "Experience crystal-clear sound quality with our premium wireless headphones...",
            rating: "4.8",
            reviews: "256 reviews",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop"
           };
        }

        if (foundProduct) {
          // Normalize data structure for the details page
          setProduct({
            ...foundProduct,
            name: foundProduct.name || foundProduct.title,
            // Ensure images is an array, fallback to single image
            images: foundProduct.images || [foundProduct.image],
            features: foundProduct.features || [
              "High quality materials",
              "Durable construction", 
              "Modern design",
              "Satisfaction guaranteed"
            ],
            specifications: foundProduct.specifications || [
              { name: "Brand", value: foundProduct.brand || foundProduct.source || "Generic" },
              { name: "Condition", value: "New" },
              { name: "Availability", value: "In Stock" },
              { name: "Source", value: foundProduct.source || "External Vendor" }
            ]
          });
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Product not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn't find the product details you were looking for.</p>
        <Button onClick={() => navigate('/products')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          Back to Search
        </Button>
      </div>
    );
  }

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
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center p-8">
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                onError={(e) => { e.target.src = '/api/placeholder/600/600'; }}
              />
            </div>
            {/* Thumbnail grid (placeholders if only 1 image exists) */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-emerald-500 transition-colors p-2">
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail`} 
                    className="w-full h-full object-contain" 
                    onError={(e) => { e.target.src = '/api/placeholder/100/100'; }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <Card className="glass-card border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                        {product.brand}
                      </p>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        {product.name}
                      </h1>
                    </div>
                    {product.discount && (
                        <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                            {product.discount} OFF
                        </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/50">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1.5 font-bold text-yellow-700 dark:text-yellow-500">{product.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-b border-gray-100 dark:border-gray-700 py-6">
                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-lg text-gray-400 line-through mb-1">
                        {formatPrice(product.originalPrice)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Price provided by {product.source || 'vendor'}
                  </p>
                </div>
                
                <div className="prose prose-sm dark:prose-invert">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description || "No detailed description available for this product."}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button 
                    onClick={() => window.open(product.url, '_blank')}
                    className="flex-1 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 font-bold text-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Visit Website
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <Package className="w-6 h-6 mb-2 text-blue-500" />
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Free Shipping</div>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <Shield className="w-6 h-6 mb-2 text-emerald-500" />
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Secure Payment</div>
                  </div>
                  <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <Truck className="w-6 h-6 mb-2 text-purple-500" />
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Fast Delivery</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Specifications Card */}
            <Card className="glass-card mt-8 border-none shadow-lg bg-white/50 dark:bg-gray-800/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                  Specifications
                </h3>
                <div className="grid grid-cols-1 gap-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{spec.name}</span>
                      <span className="text-gray-900 dark:text-white font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
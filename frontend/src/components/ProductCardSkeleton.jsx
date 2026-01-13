
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300 animate-pulse">
      <Skeleton className="h-48 w-full" />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
        
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-14 mt-1" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

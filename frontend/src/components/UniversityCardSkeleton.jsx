
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const UniversityCardSkeleton = () => {
  return (
    <div className="glass-card overflow-hidden transition-all duration-300 animate-pulse">
      <Skeleton className="h-48 w-full" />
      
      <div className="p-5">
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        <div className="mb-4">
          <Skeleton className="h-4 w-40 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default UniversityCardSkeleton;

import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-[32px] p-4 border border-neutral-100 flex flex-col h-full animate-pulse">
      <div className="aspect-square bg-neutral-100 rounded-2xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-neutral-100 rounded-full w-1/4"></div>
        <div className="h-4 bg-neutral-100 rounded-full w-3/4"></div>
        <div className="h-4 bg-neutral-100 rounded-full w-1/2"></div>
        <div className="pt-4 flex flex-col gap-2">
          <div className="h-6 bg-neutral-100 rounded-full w-2/3"></div>
          <div className="h-3 bg-neutral-100 rounded-full w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;

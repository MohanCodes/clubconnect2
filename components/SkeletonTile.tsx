import React from 'react';

const SkeletonTile: React.FC = () => {
  return (
    <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] relative max-w-4xl">
      {/* Icon and Club Name */}
      <div className="flex items-center mb-4 mr-6 space-x-4">
        <div className="w-[45px] h-[45px] bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
      </div>

      {/* Club Description */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse"></div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mt-4 mb-6">
        <hr className="flex-grow border-t border-gray-600" />
        <div className="flex gap-4 justify-center">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
          ))}
        </div>
        <hr className="flex-grow border-t border-gray-600" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-6 bg-gray-700 rounded-full w-16 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTile;
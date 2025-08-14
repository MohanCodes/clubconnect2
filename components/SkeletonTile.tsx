import React from 'react';

const SkeletonTile: React.FC = () => {
  return (
    <div className="rounded-xl p-6 transition-shadow duration-300 bg-tilegrey relative w-full h-full flex flex-col justify-between">
      {/* Icon and Club Name */}
      <div className="flex items-center mb-4 space-x-4">
        <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
      </div>

      <p className="text-md text-grey mb-4 text-left line-clamp-4 invisible">MNClubConnect is a dynamic platform designed to foster community engagement among students in the West Metro area. It serves as a centralized hub where users can discover and connect with various clubs tailored to their interests.</p>

      {/* Club Description */}
      <div className="space-y-2 flex-grow -mt-28">
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
import React from 'react';

const ClubCommunityBanner: React.FC = () => {
  return (
    <div className="bg-black text-white p-8 rounded-lg text-center max-w-md mx-auto border border-blue-500">
      <h1 className="text-3xl font-bold mb-4">
        <span className="text-blue-500">Connect</span> with your club community.
      </h1>
      <p className="text-lg mb-6">
        Currently a club database for students located in the west metro.
      </p>
      <div className="flex justify-center items-center">
        <input
          type="text"
          placeholder="Search for a club"
          className="p-3 rounded-l-full border-none outline-none w-64"
        />
        <button className="p-3 rounded-r-full bg-blue-500 text-white">
          Search
        </button>
      </div>
    </div>
  );
};

export default ClubCommunityBanner;
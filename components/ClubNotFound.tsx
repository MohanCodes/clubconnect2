"use client";

const ClubNotFound: React.FC = () => {
  return (
    <div className="bg-cblack min-h-screen flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center justify-center text-white">
        <div className="text-5xl font-semibold">
          Club <span className="text-azul">Not Found</span>
        </div>
        <p className="text-xl mt-6 text-grey max-w-lg">
          We couldn&apos;t find the club you&apos;re looking for. It may have been removed or doesn&apos;t exist.
        </p>
        <div className="mt-10 flex space-x-4">
          <button 
            className="px-8 py-3 rounded-full bg-azul text-white hover:opacity-70 transition-opacity"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubNotFound;
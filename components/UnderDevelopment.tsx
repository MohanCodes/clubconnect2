"use client";

const UnderDevelopment: React.FC = () => {
  return (
    <div className="bg-cblack min-h-screen flex flex-col items-center justify-center text-center -mt-20">
      <div className="flex flex-col items-center justify-center text-white">
        <div className="text-5xl font-semibold">
          Page Under <span className="text-azul">Development</span>
        </div>
        <p className="text-xl mt-6 text-grey max-w-lg">
          We’re working hard to bring this page to life! Please check back soon or reach out if you have questions.
        </p>
        <button 
          className="mt-10 px-8 py-3 rounded-full bg-azul text-white hover:opacity-70 transition-opacity"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UnderDevelopment;

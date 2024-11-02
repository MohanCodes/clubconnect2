"use client";

import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="bg-cblack min-h-screen flex flex-col items-center justify-center text-center -mt-20">
      <div className="flex flex-col items-center justify-center text-white">
        <div className="text-5xl font-semibold">
          404 - <span className="text-azul">Page Not Found</span>
        </div>
        <p className="text-xl mt-6 text-grey max-w-lg">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex space-x-4">
          <Link href="/" passHref>
            <button className="px-8 py-3 rounded-full bg-azul text-white hover:opacity-70 transition-opacity">
              Go Home
            </button>
          </Link>
          <button 
            className="px-8 py-3 rounded-full border border-azul text-azul hover:bg-azul hover:text-white transition-colors"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import dynamic from 'next/dynamic';

const Link = dynamic(() => import('next/link'));
const Image = dynamic(() => import('next/image'));

import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebase';
import { signOut, User } from 'firebase/auth';
import { FaTimes, FaBars } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Close navbar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // Adjust breakpoint as needed
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignOutModalOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-cblack">
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center md:space-x-4">
          <Image
            src="/circles.svg"
            alt="Logo"
            width={60}
            height={60}
            className="h-9 md:h-10"
            priority
          />
          <span className="text-xl md:text-3xl font-bold text-white">
            <span className="text-grey">MN</span><span className="text-white">Club</span><span className="text-azul">Connect</span>
          </span>
        </Link>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden text-white"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <FaTimes size={32} /> : <FaBars size={30} />}
        </button>

        <div 
          className={`${
            isOpen 
              ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur' 
              : 'hidden lg:flex lg:items-center lg:space-x-10 lg:static'
          } flex-col space-y-4 text-lg lg:flex-row lg:space-y-0 lg:bg-transparent`}
        >
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-5 text-white text-md"
              aria-label="Close menu"
            >
              <FaTimes size={32} />
            </button>
          )}

          <Link href="/" className="text-white hover:text-azul">Home</Link>
          <Link href="/about" className="text-white hover:text-azul">About</Link>
          <Link href="/blog" className="text-white hover:text-azul">Blog</Link>
          
          {user && (
            <div className={`flex ${isOpen ? 'flex-col space-y-4' : 'hidden lg:flex lg:flex-row lg:space-x-10'} text-center`}>
              <Link href="/dashboard" className="text-white hover:text-azul">Dashboard</Link>
            </div>
          )}

          {user ? (
            <button 
              onClick={() => setIsSignOutModalOpen(true)} 
              className="rounded-full text-azul hover:opacity-70 md:pr-0 lg:pr-4"
            >
              Sign Out
            </button>
          ) : (
            <div className={`flex ${isOpen ? 'flex-col space-y-4' : 'hidden lg:flex lg:flex-row lg:space-x-10'} items-center`}>
              <Link href="/signin" className="text-white hover:text-azul">Sign In</Link>
              <Link href="/signup" className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>

      {isSignOutModalOpen && (
        <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sign Out</h2>
              <button onClick={() => setIsSignOutModalOpen(false)} aria-label="Close sign out modal" className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <p className="mb-4">Are you sure you want to sign out?</p>
            {/* Improved column layout for buttons */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setIsSignOutModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                aria-label="Cancel sign out"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                aria-label="Confirm sign out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

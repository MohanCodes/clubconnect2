"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebase'; // Adjust the path as necessary
import { signOut, User } from 'firebase/auth'; // Import User type

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Specify the state type
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Set the user state based on authentication status
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      alert('Signed out successfully!'); // Optional: Notify user
    } catch (error) {
      console.error('Sign out error:', error); // Handle errors here
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-cblack">
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-4">
          <img src="/circles.svg" alt="Logo" className="h-10" />
          <span className="text-2xl font-bold text-white">
            Club<span className="text-azul">Connect</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden text-white"
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>

        {/* Navigation Links */}
        <div 
          className={`
            ${isOpen ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur' : 'hidden lg:flex lg:items-center lg:space-x-10 lg:static'} 
            flex-col space-y-4 text-lg lg:flex-row lg:space-y-0 lg:bg-transparent
          `}
        >
          {/* Close Button */}
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-5 text-white text-md"
            >
              Close
            </button>
          )}

          <Link href="/home" className="text-white hover:text-azul">Home</Link>
          <Link href="/about" className="text-white hover:text-azul">About</Link>
          <Link href="/blog" className="text-white hover:text-azul">Blog</Link>
          <Link href="/calendar" className="text-white hover:text-azul">Calendar</Link>

          {/* Conditional Dashboard Link */}
          {user && (
            <Link href="/dashboard" className="text-white hover:text-azul">Dashboard</Link>
          )}

          {/* Conditional Sign Out Button */}
          {user ? (
            <button 
              onClick={handleSignOut} 
              className="px-7 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white hover:opacity-70"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/signup" className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
              Signup
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

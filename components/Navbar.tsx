"use client";

import Link from 'next/link';
import Image from 'next/image';
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsSignOutModalOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-cblack">
      <div className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-4">
          <Image
            src="/circles.svg"
            alt="Logo"
            width={60}
            height={60}
            className="h-10"
          />
          <span className="text-3xl font-bold text-white">
            Club<span className="text-azul">Connect</span>
          </span>
        </Link>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden text-white"
        >
          {isOpen ? <FaTimes size={32} /> : <FaBars size={30} />}
        </button>

        <div 
          className={`
            ${isOpen ? 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur' : 'hidden lg:flex lg:items-center lg:space-x-10 lg:static'} 
            flex-col space-y-4 text-lg lg:flex-row lg:space-y-0 lg:bg-transparent
          `}
        >
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-5 text-white text-md"
            >
              <FaTimes size={32} />
            </button>
          )}

          <Link href="/about" className="text-white hover:text-azul">About</Link>
          <Link href="/blog" className="text-white hover:text-azul">Blog</Link>
          <Link href="/calendar" className="text-white hover:text-azul">Calendar</Link>
          

          {user && (
            <Link href="/dashboard" className="text-white hover:text-azul">Dashboard</Link>
          )}

          {user ? (
            <button 
              onClick={() => setIsSignOutModalOpen(true)} 
              className="px-7 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white hover:opacity-70"
            >
              Sign Out
            </button>
          ) : (
            <div>
              <Link href="/signin" className="text-white hover:text-azul mr-10">Sign In</Link>
              <Link href="/signup" className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>

      {isSignOutModalOpen && (
        <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Sign Out</h2>
              <button onClick={() => setIsSignOutModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <p className="mb-4">Are you sure you want to sign out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsSignOutModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
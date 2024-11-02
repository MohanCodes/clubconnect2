"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebase/firebase'; // Adjust path as needed
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { FaGoogle } from 'react-icons/fa';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
        // Add any other initial user data you want to store
      });

      router.push('/');
    } catch (error) {
      setError('Failed to sign up. Please try again.');
      console.error('Error signing up:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if the user document already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // If the user document doesn't exist, create it
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
          // Add any other initial user data you want to store
        });
      }

      router.push('/');
    } catch (error) {
      setError('Failed to sign up with Google. Please try again.');
      console.error('Error signing up with Google:', error);
    }
  };

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-cblack text-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-azul p-6 text-center relative">
            <div className="absolute inset-0 flex justify-center mt-8">
              <div className="w-24 h-24 bg-cblack rounded-full"></div>
            </div>
            <Image src="/circles.svg" alt="Club Connect Logo" width={60} height={60} className="relative z-10 mx-auto mb-10 mt-6" />
            <h1 className="text-3xl font-semibold text-white">Sign Up for Club Connect</h1>
            <p className="text-grey mt-2">Join your club community</p>
          </div>
          <div className="p-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-azul text-white py-2 px-4 rounded-full hover:opacity-70 transition-opacity duration-300"
              >
                Sign Up
              </button>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaGoogle className="mr-2" size={20} />
                  Sign up with Google
                </button>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="font-medium text-azul hover:opacity-70">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
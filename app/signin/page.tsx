"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebase/firebase'; // Adjust path as needed
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { FaGoogle } from 'react-icons/fa';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const updateUserData = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // If the user doesn't exist in Firestore, create a new document
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
      });
    } else {
      // If the user exists, update their last login time
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateUserData(userCredential.user);
      router.push('/');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials and try again.');
      console.error('Error signing in:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await updateUserData(result.user);
      router.push('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-20">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-azul p-6 text-center relative">
            <div className="absolute inset-0 flex justify-center mt-8">
              <div className="w-24 h-24 bg-cblack rounded-full"></div> {/* Circle */}
            </div>
            
            <Image src="/circles.svg" alt="Club Connect Logo" width={60} height={60} className="relative z-10 mx-auto mb-10 mt-6" />
            <h1 className="text-3xl font-semibold text-white">Sign In to Club Connect</h1>
            <p className="text-grey mt-2">Access your club community</p>
          </div>
          <div className="p-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
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
                Sign In
              </button>
            </form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign in with</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaGoogle className="mr-2" size={20} />
                  Sign in with Google
                </button>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-azul hover:opacity-70">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
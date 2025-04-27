"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase"; // Adjust path as needed
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset email has been sent. Please check your inbox.");
      setEmail("");
    } catch (err: any) {
      setError(
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : "Failed to send reset email. Please try again."
      );
    }
    setLoading(false);
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
            <Image
              src="/circles.svg"
              alt="MNClubConnect Logo"
              width={60}
              height={60}
              className="relative z-10 mx-auto mb-10 mt-6"
            />
            <h1 className="text-3xl font-semibold text-white">Forgot Password?</h1>
            <p className="text-white mt-2">We'll send you a reset link</p>
          </div>
          <div className="p-8">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p>{message}</p>
              </div>
            )}
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-azul text-white py-2 px-4 rounded-full hover:opacity-70 transition-opacity duration-300"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-600">
              Remembered your password?{" "}
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

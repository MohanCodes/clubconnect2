import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function About() {
  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-20">
        <div className='max-w-3xl flex flex-col justify-center h-screen items-center'>
          <h1 className='font-semibold text-white text-5xl mb-8'>
            About <span className='text-azul'>ClubConnect</span>
          </h1>
          <p className="text-xl mb-6 text-center text-grey">
            ClubConnect is your gateway to the vibrant club community in the west metro area. We&apos;re dedicated to helping students discover, connect with, and engage in local clubs and organizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h2 className="text-2xl font-semibold text-azul mb-4">Our Mission</h2>
              <p className="text-grey">
                To foster a thriving ecosystem of student clubs by providing a centralized platform for discovery, communication, and collaboration.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-azul mb-4">What We Offer</h2>
              <ul className="list-disc list-inside text-grey">
                <li>Comprehensive club database</li>
                <li>Easy-to-use search functionality</li>
                <li>Direct links to club social media and websites</li>
                <li>Up-to-date event calendars</li>
              </ul>
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-azul mb-4">Get Involved</h2>
            <p className="text-grey mb-6">
              Whether you&apos;re looking to join a club or promote your own, ClubConnect is here to help. Join our community today!
            </p>
            <button className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
              Join ClubConnect
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
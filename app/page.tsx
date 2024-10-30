"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebase'; // Adjust the path as necessary
import Tile from '@/components/Tile';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface DisplayClub {
  id: string;
  icon?: string;
  name: string;
  description: string;
  tags: string[];
  links: { platform: string; url: string }[];
  isComplete: boolean; // Ensure this field is included
}

const Home: React.FC = () => {
  const [clubs, setClubs] = useState<DisplayClub[]>([]); // Specify the state type

  useEffect(() => {
    const fetchClubs = async () => {
      const q = query(collection(db, 'clubs'), where('isComplete', '==', true));
      const querySnapshot = await getDocs(q);
      const clubsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DisplayClub[]; // Cast to Club[]
      setClubs(clubsData);
    };

    fetchClubs();
  }, []);

  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-20">
        <div className='max-w-lg flex flex-col justify-center h-screen items-center'>
          <div className='font-semibold text-white text-5xl'>
            <span className='text-azul'>Connect</span> with your club community.
          </div>
          <p className="text-xl my-6 text-center text-grey">
            Currently a club database for students located in the west metro.
          </p>
          <div className="space-x-4 border-blue-500 pt-4 flex flex-row">
            <input
              type="text"
              placeholder="Wayzata CSC"
              className="px-5 py-3 rounded-full border-none outline-none w-96 text-gray-700"
            />
            <button className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
              Search
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-full">
          {clubs.map(club => (
            <Link href={`/club/${club.id}`} key={club.id}>
              <Tile
                key={club.id}
                icon={club.icon || "circles.svg"} // Use a default icon if none is provided
                clubName={club.name}
                description={club.description}
                tags={club.tags}
                links={club.links}
              />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/firebase/firebase'; // Adjust path as needed
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile'

interface Club {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  links: { [key: string]: string };
}

const Dashboard: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/signin');
      } else {
        fetchClubs(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchClubs = async (userId: string) => {
    try {
      const clubsRef = collection(db, 'clubs');
      const q = query(clubsRef, where('creatorId', '==', userId));
      const querySnapshot = await getDocs(q);
      const clubsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Club));
      setClubs(clubsData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
  }

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Clubs</h1>
        {clubs.length === 0 ? (
          <p className="text-gray-300">You haven't created any clubs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const formattedLinks = Object.entries(club.links).map(([platform, url]) => ({
                platform,
                url
              }));

              return (
                <Tile
                  key={club.name}
                  icon="circles.svg"
                  clubName={club.name}
                  description={club.description}
                  tags={club.tags}
                  links={formattedLinks}
                />
              );
            })}
          </div>
        )}
        <button 
          onClick={() => router.push('/dashboard/create-club')}
          className="fixed bottom-8 right-8 bg-azul text-white p-4 rounded-full shadow-lg hover:opacity-80 transition-opacity"
          aria-label="Create new club"
        >
          <FaPlus size={24} />
        </button>
      </main>
    </div>
  );
};

export default Dashboard;
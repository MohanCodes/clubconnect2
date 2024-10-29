"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/firebase/firebase';
import { collection, getDocs, query, where, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile'

interface DashClub {
  id: string;
  name: string;
  school: string;
  creatorId: string;
  createdAt: Date;
  creatorName: string;
  isComplete: boolean;
}

const Dashboard: React.FC = () => {
  const [clubs, setClubs] = useState<DashClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubSchool, setNewClubSchool] = useState('');
  const [error, setError] = useState('');
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
        ...doc.data(),
        isComplete: doc.data().isComplete || false // Ensure isComplete is included
      } as DashClub));
      setClubs(clubsData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async () => {
    if (newClubName && newClubSchool && user) {
      try {
        // Check if the club already exists in clubs
        const clubsRef = collection(db, 'clubs');
        const clubQuery = query(
          clubsRef, 
          where('name', '==', newClubName),
          where('school', '==', newClubSchool)
        );
        const clubSnapshot = await getDocs(clubQuery);
  
        if (!clubSnapshot.empty) {
          setError('A club with this name already exists at this school.');
          return;
        }
  
        // Create the document ID
        const docId = `${newClubName.replace(/\s+/g, '-')}-${newClubSchool.replace(/\s+/g, '-')}`.toLowerCase();
  
        const newClub = {
          name: newClubName,
          school: newClubSchool,
          creatorId: user.uid,
          createdAt: serverTimestamp(),
          creatorName: user.displayName,
          isComplete: false,
        };
        
        // Use setDoc instead of addDoc to specify the document ID
        await setDoc(doc(clubsRef, docId), newClub);
        
        // Update local state
        setClubs(prevClubs => [...prevClubs, { ...newClub, id: docId, createdAt: new Date() }]);
        
        // Close modal and reset form
        setIsModalOpen(false);
        setNewClubName('');
        setNewClubSchool('');
        setError('');
        
        // Navigate to edit page
        router.push(`/edit-club/${encodeURIComponent(docId)}`);
      } catch (error) {
        console.error("Error creating club:", error);
        setError('An error occurred while creating the club. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Clubs</h1>
        {clubs.length === 0 ? (
          <p className="text-gray-300">You haven&apos;t created any clubs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="relative">
                <Tile
                  icon="circles.svg"
                  clubName={club.name}
                  description={`School: ${club.school}`}
                  tags={[]}
                  links={[]}
                />
                {!club.isComplete && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black p-2 rounded-bl-lg flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    <span className="text-sm">Incomplete</span>
                  </div>
                )}
                <button 
                  onClick={() => {
                    const slug = `${club.name.replace(/\s+/g, '-')}-${club.school.replace(/\s+/g, '-')}`.toLowerCase();
                    router.push(`/edit-club/${encodeURIComponent(slug)}`);
                  }}
                  className="absolute bottom-0 left-0 right-0 bg-azul text-white p-2 text-center"
                >
                  {club.isComplete ? 'View/Edit Club' : 'Complete Club Info'}
                </button>
              </div>
            ))}
          </div>
        )}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-azul text-white p-4 rounded-full shadow-lg hover:opacity-80 transition-opacity"
          aria-label="Create new club"
        >
          <FaPlus size={24} />
        </button>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Club</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <input
              type="text"
              placeholder="Club Name"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="text"
              placeholder="School"
              value={newClubSchool}
              onChange={(e) => setNewClubSchool(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
            <button
              onClick={handleCreateClub}
              className="w-full bg-azul text-white p-2 rounded hover:bg-blue-600"
            >
              Create Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

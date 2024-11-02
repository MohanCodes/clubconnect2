"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/firebase/firebase';
import { collection, getDocs, query, where, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile'

interface User {
  uid: string;
  displayName: string | null;
}

interface DashClub {
  id: string;
  name: string;
  school: string;
  creatorId: string;
  createdAt: Date;
  creatorName: string;
  isComplete: boolean;
  tags: string[];
  upvoteCount: number;
}

const schoolDistricts = [
  "Wayzata Public Schools",
  "Minnetonka Public Schools",
  "Edina Public Schools",
  "Hopkins School District",
  "St. Louis Park Public Schools",
  "Osseo Area Schools",
  "Robbinsdale Area Schools",
  "Anoka-Hennepin School District"
];

const Dashboard: React.FC = () => {
  const [clubs, setClubs] = useState<DashClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubSchool, setNewClubSchool] = useState('');
  const [error, setError] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const typedUser: User = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
        };
        setUser(typedUser);
        fetchClubs(currentUser.uid);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        router.push('/signin');
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
        isComplete: doc.data().isComplete || false,
        tags: doc.data().tags || [],
        upvoteCount: doc.data().upvoteCount || 0
      } as DashClub));
      setClubs(clubsData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedSchool(userData.selectedSchool || '');
        setSelectedClubs(userData.selectedClubs || []);
        setUpvotedClubs(userData.upvotedClubs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleCreateClub = async () => {
    if (newClubName && newClubSchool && user) {
      try {
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
  
        const docId = `${newClubName.replace(/\s+/g, '-')}-${newClubSchool.replace(/\s+/g, '-')}`.toLowerCase();
  
        const newClub = {
          name: newClubName,
          school: newClubSchool,
          creatorId: user.uid,
          createdAt: serverTimestamp(),
          creatorName: user.displayName || 'Unknown',
          isComplete: false,
          tags: [newClubSchool.split(' ')[0]] // Add the first word of the school as a tag
        };
        
        await setDoc(doc(clubsRef, docId), newClub);
        
        setClubs(prevClubs => [...prevClubs, { ...newClub, id: docId, createdAt: new Date() }]);
        
        setIsModalOpen(false);
        setNewClubName('');
        setNewClubSchool('');
        setError('');
        
        router.push(`/edit-club/${encodeURIComponent(docId)}`);
      } catch (error) {
        console.error("Error creating club:", error);
        setError('An error occurred while creating the club. Please try again.');
      }
    }
  };

  const handleSelectSchool = async (school: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          selectedSchool: school
        });
        setSelectedSchool(school);
      } catch (error) {
        console.error("Error selecting school:", error);
      }
    }
  };

  const handleSelectClub = async (clubId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          selectedClubs: arrayUnion(clubId)
        });
        setSelectedClubs(prevClubs => [...prevClubs, clubId]);
      } catch (error) {
        console.error("Error selecting club:", error);
      }
    }
  };

  const handleDeselectClub = async (clubId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          selectedClubs: arrayRemove(clubId)
        });
        setSelectedClubs(prevClubs => prevClubs.filter(id => id !== clubId));
      } catch (error) {
        console.error("Error deselecting club:", error);
      }
    }
  };

  const handleUpvoteClub = async (clubId: string) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData.upvotedClubs && userData.upvotedClubs.includes(clubId)) {
          console.log("Club already upvoted by this user.");
          return;
        }

        await updateDoc(doc(db, 'users', user.uid), {
          upvotedClubs: arrayUnion(clubId)
        });
        setUpvotedClubs(prevClubs => [...prevClubs, clubId]);

        const clubRef = doc(db, 'clubs', clubId);
        await updateDoc(clubRef, {
          upvoteCount: increment(1)
        });

        setClubs(prevClubs => prevClubs.map(club => 
          club.id === clubId ? { ...club, upvoteCount: club.upvoteCount + 1 } : club
        ));
      } catch (error) {
        console.error("Error upvoting club:", error);
      }
    }
  };

  const handleRemoveUpvote = async (clubId: string) => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          upvotedClubs: arrayRemove(clubId)
        });
        setUpvotedClubs(prevClubs => prevClubs.filter(id => id !== clubId));

        const clubRef = doc(db, 'clubs', clubId);
        await updateDoc(clubRef, {
          upvoteCount: increment(-1)
        });

        setClubs(prevClubs => prevClubs.map(club => 
          club.id === clubId ? { ...club, upvoteCount: club.upvoteCount - 1 } : club
        ));
      } catch (error) {
        console.error("Error removing upvote:", error);
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
          <p className="text-gray-300 w-2/3">You haven&apos;t created any clubs yet.<br />
          Note that only groups that have either successfully gone through the student group application process or a club affiliated with your school body should create a club.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div key={club.id} className="relative">
                <Tile
                  icon="circles.svg"
                  clubName={club.name}
                  description={`School: ${club.school}`}
                  tags={club.tags}
                  links={[]}
                  upvoteCount={club.upvoteCount.toString()}
                  isUpvoted={upvotedClubs.includes(club.id)}
                  onUpvote={() => handleUpvoteClub(club.id)}
                  onRemoveUpvote={() => handleRemoveUpvote(club.id)}
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
                  className="absolute -bottom-9 left-0 right-0 bg-azul text-white p-2 text-center mt-2 rounded"
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
            <select
              value={newClubSchool}
              onChange={(e) => setNewClubSchool(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select School District</option>
              {schoolDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
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

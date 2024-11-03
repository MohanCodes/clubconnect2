"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebase';
import { doc, updateDoc, arrayRemove, increment, getDoc, getDocs, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import Tile from '@/components/Tile'; // Import Tile component

interface User {
  uid: string;
  displayName: string | null;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const [clubs, setClubs] = useState<any[]>([]); // State to hold club data
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const typedUser: User = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
        };
        setUser(typedUser);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        router.push('/signin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedSchool(userData.selectedSchool || '');
        setUpvotedClubs(userData.upvotedClubs || []);
        // Fetch clubs based on upvotedClubs
        await fetchClubs(userData.upvotedClubs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchClubs = async (clubIds: string[]) => {
    try {
      const clubsData = await Promise.all(clubIds.map(async (clubId) => {
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        return clubDoc.exists() ? { id: clubId, ...clubDoc.data() } : null;
      }));
      setClubs(clubsData.filter(Boolean)); // Filter out any null values
    } catch (error) {
      console.error("Error fetching clubs:", error);
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
        
        // Remove the club from local state
        setClubs(prevClubs => prevClubs.filter(club => club.id !== clubId));
      } catch (error) {
        console.error("Error removing upvote:", error);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Your Profile</h1>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Starred Clubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Tile 
              key={club.id}
              icon={club.icon || "circles.svg"} // Provide a default icon if none exists
              clubName={club.name}
              description={club.description}
              tags={club.tags}
              links={club.links}
              upvoteCount={club.upvoteCount || 0}
              isUpvoted={upvotedClubs.includes(club.id)}
              onUpvoteClick={(e) => handleRemoveUpvote(club.id)} // Handle remove upvote
              isUpvoteLoading={false} // You can manage loading state if needed
              showVoteButton={true} // Always show vote button for upvoted clubs
            />
          ))}
        </div>
        {clubs.length === 0 && (
          <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] md:w-1/2">
              <p className="text-gray-300">
                  You haven&apos;t starred any clubs yet.<br />
                  <span className='text-white font-semibold'>Star</span> a few of your favorite <span className='text-white font-semibold'>clubs</span> to see them on the calendar! 
                  <br /><br />
                  Remember, your engagement matters! By <span className='text-white font-semibold'>starring</span> clubs, you not only keep track of what <span className='text-white font-semibold'>interests</span> you but also help <span className='text-white font-semibold'>support</span> your favorite clubs!</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Profile;
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';

const Profile: React.FC = () => {
  const [user, setUser] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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
        setSelectedClubs(userData.selectedClubs || []);
        setUpvotedClubs(userData.upvotedClubs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        await updateDoc(doc(db, 'users', user.uid), {
          upvotedClubs: arrayUnion(clubId)
        });
        setUpvotedClubs(prevClubs => [...prevClubs, clubId]);
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
      } catch (error) {
        console.error("Error removing upvote:", error);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Your Profile</h1>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Selected School</h2>
          <select
            value={selectedSchool}
            onChange={(e) => handleSelectSchool(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="">Select School District</option>
            <option value="Wayzata Public Schools">Wayzata Public Schools</option>
            <option value="Minnetonka Public Schools">Minnetonka Public Schools</option>
            <option value="Edina Public Schools">Edina Public Schools</option>
            <option value="Hopkins School District">Hopkins School District</option>
            <option value="St. Louis Park Public Schools">St. Louis Park Public Schools</option>
            <option value="Osseo Area Schools">Osseo Area Schools</option>
            <option value="Robbinsdale Area Schools">Robbinsdale Area Schools</option>
            <option value="Anoka-Hennepin School District">Anoka-Hennepin School District</option>
          </select>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Selected Clubs</h2>
          <ul>
            {selectedClubs.map((clubId) => (
              <li key={clubId} className="text-white mb-2">
                {clubId}
                <button
                  onClick={() => handleDeselectClub(clubId)}
                  className="ml-2 text-red-500"
                >
                  Deselect
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Upvoted Clubs</h2>
          <ul>
            {upvotedClubs.map((clubId) => (
              <li key={clubId} className="text-white mb-2">
                {clubId}
                <button
                  onClick={() => handleRemoveUpvote(clubId)}
                  className="ml-2 text-red-500"
                >
                  Remove Upvote
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Profile;

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/firebase';
import { doc, updateDoc, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile'; // Import Tile component
import Link from 'next/link';
import { FaAddressBook, FaStar } from 'react-icons/fa';
import InviteLink from './InviteLink';

interface User {
  uid: string;
  displayName: string | null;
}

interface Advisor {
  name: string;
  email: string;
}

interface StudentLead {
  name: string;
  role: string;
  email: string;
}

interface ClubLink {
  url: string;
  platform: string;
}

interface OneOffEvent {
  date: string; // Store as 'YYYY-MM-DD' string
  title: string;
}

interface RecurringEvent {
  title: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  exceptions: string[]; // Array of 'YYYY-MM-DD' strings
}

interface ClubInfo {
  id: string;
  isComplete: boolean;
  name: string;
  school: string;
  tags: string[];
  description: string;
  length: string;
  meetingTimes: string;
  meetingSite: string;
  eligibility: string;
  costs: string;
  advisors: Advisor[];
  studentLeads: StudentLead[];
  links: ClubLink[];
  images: string[];
  recurringEvents: RecurringEvent[];
  oneOffEvents: OneOffEvent[];
  blogIds: string[];
  icon?: string; // Optional icon property
  upvoteCount: number;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const [clubs, setClubs] = useState<ClubInfo[]>([]); // State to hold club data
  const router = useRouter();

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUpvotedClubs(userData.upvotedClubs || []);
        // Fetch clubs based on upvotedClubs
        await fetchClubs(userData.upvotedClubs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const fetchClubs = async (clubIds: string[]) => {
    try {
      const clubsData = await Promise.all(clubIds.map(async (clubId) => {
        const clubDoc = await getDoc(doc(db, 'clubs', clubId));
        return clubDoc.exists() ? { id: clubId, ...clubDoc.data() } as ClubInfo : null; // Cast to ClubInfo
      }));
      setClubs(clubsData.filter((club): club is ClubInfo => club !== null)); // Filter out null values and assert type
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const typedUser: User = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
        };
        setUser(typedUser);
        fetchUserData(currentUser.uid); // Call fetchUserData
      } else {
        setUser(null);
        router.push('/signin');
      }
    });

    return () => unsubscribe();
  }, [router, fetchUserData]); // Include fetchUserData in the dependency array

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

  const handleClubClick = (clubId: string) => {
    router.push(`/club/${clubId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-white mb-4">Starred Clubs</h1>
      <p className="text-gray-300 mb-6">
        If you star a club on the main page, you&apos;ll be able to see your saved clubs here.
      </p>
      <div className="mb-6">
        <div className="
            columns-1
            lg:columns-2
            xl:columns-3
            gap-6
            max-w-full
        ">
          {clubs.map((club) => (
            <div
              key={club.id}
              onClick={() => handleClubClick(club.id)}
              className="mb-6 break-inside-avoid cursor-pointer"
            >
              <Tile
                icon={club.icon}
                clubName={club.name}
                tags={[]}
                links={[]}
                upvoteCount={club.upvoteCount || 0}
                isUpvoted={upvotedClubs.includes(club.id)}
                onUpvoteClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUpvote(club.id);
                }}
                isUpvoteLoading={false}
                showVoteButton={true}
              />
            </div>
          ))}
        </div>

        {clubs.length === 0 && (
          <div className="rounded-xl p-9 transition-shadow duration-300 bg-tilegrey md:w-2/3 lg:w-1/2 flex flex-col gap-4">
          
            {/* Star club container */}
            <div className="flex items-start gap-4">
              <Link href="/">
                <div className="bg-azul text-white font-bold flex items-center justify-center rounded-md hover:bg-blue-500 h-12 w-12">
                  <FaStar size={20}/>
                </div>
              </Link>
              <p className="text-gray-300">
                <span className="text-white font-semibold">Star</span> a few of your favorite{" "}
                <span className="text-white font-semibold">clubs</span> to boost them on the main page,
                as well as see them on your profile!
              </p>
            </div>

            {/* Invite club container */}
            <div className="flex items-start gap-4">
              <InviteLink>
                <div className="bg-azul text-white font-bold flex items-center justify-center rounded-md hover:bg-blue-500 h-12 w-12">
                  <FaAddressBook size={20}/>
                </div>
              </InviteLink>
              <p className="text-gray-300">
                If you know a club that you want to see on here, send them an email using the{" "}
                <span className="text-white font-semibold">email button</span>!
              </p>
            </div>

          </div>
        )}


      </div>
    </div>
  );
};

export default Profile;
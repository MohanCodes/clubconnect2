"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase'; // Adjust the path as necessary
import Tile from '@/components/Tile';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

interface DisplayClub {
  id: string;
  icon?: string;
  name: string;
  description: string;
  tags: string[];
  links: { platform: string; url: string }[];
  isComplete: boolean;
  upvoteCount: number;
}

const Home: React.FC = () => {
  const [clubs, setClubs] = useState<DisplayClub[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const router = useRouter();

  const handleClubClick = (clubId: string) => {
    router.push(`/club/${clubId}`);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      const q = query(collection(db, 'clubs'), where('isComplete', '==', true));
      const querySnapshot = await getDocs(q);
      const clubsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DisplayClub[];
      setClubs(clubsData);
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUpvotedClubs(userData.upvotedClubs || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUpvoteClub = async (clubId: string) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData) {
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
            club.id === clubId ? { ...club, upvoteCount: (club.upvoteCount || 0) + 1 } : club
          ));
        }
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

  const handleUpvoteClick = (e: React.MouseEvent, clubId: string) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the parent
    if (upvotedClubs.includes(clubId)) {
      handleRemoveUpvote(clubId);
    } else {
      handleUpvoteClub(clubId);
    }
  };

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-20">
        <div className='max-w-lg flex flex-col justify-center h-screen items-center'>
          <div className='font-semibold text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center'>
            <span className='text-azul'>Connect</span> with your club community.
          </div>
          <p className="text-lg sm:text-xl my-4 sm:my-6 text-center text-grey px-4 sm:px-0 max-w-md mx-auto">
            Currently a club database for students located in the west metro.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 pt-4 flex flex-col sm:flex-row px-4 sm:px-0">
            <input
              type="text"
              placeholder="Search Wayzata CSC"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-5 py-3 rounded-full border-none outline-none w-full sm:w-96 text-gray-700"
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 p-6 max-w-full overflow-x-auto">
            {[0, 1, 2, 3].map((columnIndex) => (
              <div key={columnIndex} className="grid auto-rows-max gap-6">
                {filteredClubs
                  .filter((_, index) => index % (window.innerWidth >= 1536 ? 4 : window.innerWidth >= 768 ? 3 : window.innerWidth >= 640 ? 2 : 1) === columnIndex)
                  .map((club) => (
                    <div 
                      key={club.id} 
                      onClick={() => handleClubClick(club.id)}
                      className="cursor-pointer"
                    >
                      <Tile
                        icon={club.icon || "circles.svg"}
                        clubName={club.name}
                        description={club.description}
                        tags={club.tags}
                        links={club.links}
                        upvoteCount={club.upvoteCount ?? 0}
                        isUpvoted={upvotedClubs.includes(club.id)}
                        onUpvote={() => handleUpvoteClub(club.id)}
                        onRemoveUpvote={() => handleRemoveUpvote(club.id)}
                        onUpvoteClick={(e) => handleUpvoteClick(e, club.id)}
                      />
                    </div>
                  ))}
              </div>
            ))}
          </div>
          {filteredClubs.length <= 4 && (
            <div className="flex justify-center mt-6">
              {filteredClubs.slice(4).map((club) => (
                <div 
                  key={club.id} 
                  onClick={() => handleClubClick(club.id)}
                  className="cursor-pointer mx-3"
                >
                  <Tile
                    icon={club.icon || "circles.svg"}
                    clubName={club.name}
                    description={club.description}
                    tags={club.tags}
                    links={club.links}
                    upvoteCount={club.upvoteCount ?? 0}
                    isUpvoted={upvotedClubs.includes(club.id)}
                    onUpvote={() => handleUpvoteClub(club.id)}
                    onRemoveUpvote={() => handleRemoveUpvote(club.id)}
                    onUpvoteClick={(e) => handleUpvoteClick(e, club.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

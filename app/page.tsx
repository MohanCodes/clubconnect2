"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion, arrayRemove, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebase'; // Adjust the path as necessary
import dynamic from 'next/dynamic';
import BlurFade from '@/components/ui/blur-fade';
import Masonry from 'react-masonry-css';

const Tile = dynamic(() => import('@/components/Tile'));
const Navbar = dynamic(() => import('@/components/Navbar'));

import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import SkeletonTile from '@/components/SkeletonTile';

interface DisplayClub {
  id: string;
  icon?: string;
  name: string;
  description: string;
  tags: string[];
  links: { platform: string; url: string }[];
  isComplete: boolean;
  isDisplayed: boolean;
  isVerified: boolean;
  upvoteCount: number;
}

const breakpointColumnsObj = {
  default: 5,   // ≥1536px (2xl and up)
  1536: 4,      // ≥1536px (2xl)
  1280: 3,      // ≥1280px (xl)
  768: 2,       // ≥768px (md)
  640: 1        // <640px (sm and below)
};


const Home: React.FC = () => {
  const [clubs, setClubs] = useState<DisplayClub[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([])
  const [isUpvoteLoading, setIsUpvoteLoading] = useState<{ [key: string]: boolean }>({});;
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const router = useRouter();

  const tags = [
    "Wayzata",
    "Minnetonka",
    "Edina",
    "Hopkins",
    "St-Louis-Park",
    "Osseo",
    "Robbinsdale",
    "Anoka-Hennepin"
  ];

  const schoolColors: { [key: string]: { bg: string; text: string; ring: string } } = {
    'wayzata': { bg: 'bg-yellow-400', text: 'text-blue-500', ring: 'ring-blue-500' },
    'minnetonka': { bg: 'bg-blue-600', text: 'text-white', ring: 'ring-white' },
    'edina': { bg: 'bg-green-700', text: 'text-white', ring: 'ring-white' },
    'hopkins': { bg: 'bg-gray-200', text: 'text-blue-500', ring: 'ring-blue-500' },
    'st-louis-park': { bg: 'bg-orange-500', text: 'text-amber-950', ring: 'ring-amber-950' },
    'osseo': { bg: 'bg-orange-600', text: 'text-white', ring: 'ring-white' },
    'robbinsdale': { bg: 'bg-cyan-600', text: 'text-white', ring: 'ring-white' },
    'anoka-hennepin': { bg: 'bg-blue-900', text: 'text-white', ring: 'ring-white' },
  };

  const handleClubClick = (clubId: string) => {
    router.push(`/club/${clubId}`);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      const q = query(
        collection(db, 'clubs'),
        where('isComplete', '==', true),
        where('isDisplayed', '==', true),
      );
      const querySnapshot = await getDocs(q);
      const clubsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DisplayClub[];
      // Sort ONCE here
      clubsData.sort((a, b) => b.upvoteCount - a.upvoteCount);
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

  const handleUpvoteClick = async (e: React.MouseEvent, clubId: string) => {
    e.stopPropagation();
    setIsUpvoteLoading(prev => ({ ...prev, [clubId]: true }));
    try {
      if (upvotedClubs.includes(clubId)) {
        await handleRemoveUpvote(clubId);
      } else {
        await handleUpvoteClub(clubId);
      }
    } finally {
      setIsUpvoteLoading(prev => ({ ...prev, [clubId]: false }));
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearchQuery = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? club.tags.includes(selectedTag) : true;
    return matchesSearchQuery && matchesTag;
  });

  const handleTagClick = (tag: string) => {
    // Toggle the selected tag
    setSelectedTag(prevTag => (prevTag === tag ? null : tag));
  };
  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-cblack text-center -mt-16">
        <div className='max-w-lg flex flex-col justify-center h-[90vh] items-center'>
          <BlurFade delay={0.1}>
            <div className='font-semibold text-white text-4xl lg:text-5xl text-center'>
              <span className='text-azul'>Connect</span> with your club community.
            </div>
          </BlurFade>
          <BlurFade delay={0.3}>
            <p className="text-lg sm:text-xl my-2 sm:my-4 text-center text-grey px-4 sm:px-0 max-w-md mx-auto">
              Currently a club platform for students located in the west metro.
            </p>
          </BlurFade>
          <div className='bf1'>
            <BlurFade delay={0.3}>
              <div className="flex justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 flex-col sm:flex-row px-4 sm:px-0">
                <input
                  type="text"
                  placeholder="Search for a club:"
                  value={searchQuery}
                  onChange={(ppp) => setSearchQuery(ppp.target.value)}
                  className="mb-8 px-5 py-2 sm:py-3 rounded-full border-none outline-none w-full sm:w-96 text-gray-700 sm:text-md text-sm"
                />
              </div>
            </BlurFade>
            <div className='flex mb-12'>
              <div className="flex flex-wrap gap-2 justify-center">
              {tags.map((tag, index) => {
                const schoolStyle = schoolColors[tag.toLowerCase() as keyof typeof schoolColors] || { bg: 'bg-gray-200', text: 'text-black', ring: '' };
                  const isSelected = selectedTag === tag; // Check if the tag is selected
                  return (
                    <BlurFade key={index} delay={0.4 + index * 0.05} inView>
                    <button onClick={() => handleTagClick(tag)} className={`md:text-sm text-xs font-medium px-3 py-1 rounded-full break-words ${schoolStyle.bg} ${schoolStyle.text} ${isSelected ? `ring-2 ${schoolStyle.ring}` : ''}`}>
                          {tag}
                      </button>
                    </BlurFade>
                  );
              })}
              </div>
            </div>
          </div>
        </div>
        {/* Clubs Section */}
        <div className="flex flex-col items-center w-full">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-full gap-6 p-6"
            columnClassName="masonry-column"
          >
              {filteredClubs.map((club, index) => (
                <BlurFade key={index} delay={index * 0.05}>
                  <div 
                    onClick={() => handleClubClick(club.id)}
                    className="mb-6 break-inside-avoid cursor-pointer overflow-hidden"
                  >
                    <Tile
                      icon={club.icon}
                      clubName={club.name}
                      description={club.description}
                      tags={club.tags}
                      links={club.links}
                      upvoteCount={club.upvoteCount}
                      isUpvoted={upvotedClubs.includes(club.id)}
                      onUpvoteClick={(e) => handleUpvoteClick(e, club.id)}
                      isUpvoteLoading={isUpvoteLoading[club.id] || false}
                      showVoteButton={!!user}
                      isVerified={club.isVerified}
                    />
                  </div>
                </BlurFade>
              ))}
          </Masonry>

          {clubs.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 max-w-full -mt-[40px]">
                  {Array.from({ length: 12 }, (_, index) => (
                      <BlurFade key={index} delay={0 + index * 0.05} inView>
                          <div className="cursor-pointer overflow-hidden">
                              <SkeletonTile />
                          </div>
                      </BlurFade>
                  ))}
              </div>
          )}
          {filteredClubs.length === 0 && (
            <BlurFade delay={0} inView className='flex justify-center'>
              <div className="rounded-xl p-9 transition-shadow duration-300 bg-[#2A2A2A] lg:w-1/2 ">
                <p className="text-gray-300">
                    It looks like there are currently <span className="font-semibold text-white">no clubs available</span> for you to explore. Don&apos;t worry, though! You can easily <span className="font-semibold text-white">select another school district</span> to see if there are clubs that <span className="font-semibold text-white">pique your interest</span>. Alternatively, feel free to <span className="font-semibold text-white">search for something else</span> that might catch your eye. <br /><br />
                    Remember, our <span className="font-semibold text-white">club community</span> is always evolving, and <span className="font-semibold text-white">new opportunities</span> are just around the corner. Stay connected and keep checking back for updates on clubs that match your <span className="font-semibold text-white">passions and interests</span>!
                </p>
              </div>
            </BlurFade>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

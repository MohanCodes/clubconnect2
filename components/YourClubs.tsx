"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes, FaExclamationTriangle, FaCheckCircle} from 'react-icons/fa';
import { auth, db } from '@/firebase/firebase';
import { or, collection, getDocs, query, where, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile';
import Masonry from 'react-masonry-css';
import ScrollLock from './ScrollLock';

const breakpointColumnsObj = {
  default: 4,
  1536: 3,
  1280: 2,
  768: 2,
  640: 1 
};

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
  isComplete: boolean;
  tags: string[];
  upvoteCount: number;
  isVerified: boolean;
}

const schoolDistricts = [
  "Wayzata",
  "Minnetonka",
  "Edina",
  "Hopkins",
  "St-Louis-Park",
  "Osseo",
  "Robbinsdale"
];

const YourClubs: React.FC = () => {
  const [clubs, setClubs] = useState<DashClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubSchool, setNewClubSchool] = useState('');
  const [error, setError] = useState('');

  const [upvotedClubs, setUpvotedClubs] = useState<string[]>([]);
  const [isUpvoteLoading, setIsUpvoteLoading] = useState<{ [key: string]: boolean }>({});

  // NEW AGREEMENT STATES
  const [agreeSchoolRecognized, setAgreeSchoolRecognized] = useState(false);
  const [agreeAuthorizedBody, setAgreeAuthorizedBody] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const typedUser: User = { uid: currentUser.uid, displayName: currentUser.displayName };
        setUser(typedUser);
        fetchClubs(currentUser.uid);
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
      const q = query(
        clubsRef,
        or(
          where('creatorId', '==', userId),
          where('addedEditors', 'array-contains', userId)
        )
      );
      const querySnapshot = await getDocs(q);
      const clubsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isComplete: doc.data().isComplete || false,
        tags: doc.data().tags || [],
        upvoteCount: doc.data().upvoteCount || 0,
        isVerified: doc.data().isVerified || false
      })) as DashClub[];
      setClubs(clubsData);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async () => {
    setError('');
    const capitalizeFirstWord = (str: string) => {
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const capitalizedClubName = capitalizeFirstWord(newClubName.trim());
    const capitalizedSchool = capitalizeFirstWord(newClubSchool);

    if (!capitalizedClubName) {
      setError('Club name is required.');
      return;
    }

    if (!newClubSchool) {
      setError('Please select a school district.');
      return;
    }

    for (const district of schoolDistricts) {
      if (capitalizedClubName.includes(district)) {
        setError(`Please remove the district ${district} from the club name.`);
        return;
      }
    }

    // Ensure both agreements are checked
    if (!agreeSchoolRecognized || !agreeAuthorizedBody) {
      setError('You must agree to both verification statements before creating a club.');
      return;
    }

    if (user) {
      try {
        const newClubRef = collection(db, 'clubs');
        const docId = `${capitalizedClubName.replace(/\s+/g, '-')}-${capitalizedSchool.replace(/\s+/g, '-')}`.toLowerCase();

        // Check if the club already exists
        const clubDoc = await getDocs(query(
          newClubRef,
          where('name', '==', capitalizedClubName),
          where('school', '==', capitalizedSchool)
        ));

        if (!clubDoc.empty) {
          setError('A club with this name already exists in the selected school district.');
          return;
        }

        await setDoc(doc(newClubRef, docId), {
          id: docId,
          name: capitalizedClubName,
          school: capitalizedSchool,
          creatorId: user.uid,
          createdAt: serverTimestamp(),
          isComplete: false,
          tags: [capitalizedSchool],
          upvoteCount: 0,
          isVerified: false
        });

        setNewClubName('');
        setNewClubSchool('');
        setAgreeSchoolRecognized(false);
        setAgreeAuthorizedBody(false);
        setIsModalOpen(false);
        router.push(`/edit-club/${docId}?onboarding=true`);
      } catch (error) {
        console.error("Error creating club:", error);
        setError('An error occurred while creating the club. Please try again.');
      }
    }
  };

  const handleUpvoteClick = async (e: React.MouseEvent<HTMLButtonElement>, clubId: string) => {
    e.stopPropagation();
    if (upvotedClubs.includes(clubId)) {
      await handleRemoveUpvote(clubId);
    } else {
      await handleUpvoteClub(clubId);
    }
  };

  const handleUpvoteClub = async (clubId: string) => {
    if (user) {
      setIsUpvoteLoading(prev => ({ ...prev, [clubId]: true }));
      try {
        await updateDoc(doc(db, 'users', user.uid), { upvotedClubs: arrayUnion(clubId) });
        setUpvotedClubs(prev => [...prev, clubId]);
        await updateDoc(doc(db, 'clubs', clubId), { upvoteCount: increment(1) });
        setClubs(prev => prev.map(club => club.id === clubId ? { ...club, upvoteCount: club.upvoteCount + 1 } : club));
      } catch (error) {
        console.error("Error upvoting club:", error);
      } finally {
        setIsUpvoteLoading(prev => ({ ...prev, [clubId]: false }));
      }
    }
  };

  const handleRemoveUpvote = async (clubId: string) => {
    if (user) {
      setIsUpvoteLoading(prev => ({ ...prev, [clubId]: true }));
      try {
        await updateDoc(doc(db, 'users', user.uid), { upvotedClubs: arrayRemove(clubId) });
        setUpvotedClubs(prev => prev.filter(id => id !== clubId));
        await updateDoc(doc(db, 'clubs', clubId), { upvoteCount: increment(-1) });
        setClubs(prev => prev.map(club => club.id === clubId ? { ...club, upvoteCount: club.upvoteCount - 1 } : club));
      } catch (error) {
        console.error("Error removing upvote:", error);
      } finally {
        setIsUpvoteLoading(prev => ({ ...prev, [clubId]: false }));
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
    <div className="container mx-auto px-4 py-8">
      <ScrollLock isActive={isModalOpen} />
      <h1 className="text-3xl font-bold text-white mb-4">Your Club Pages</h1>
      <p className="text-gray-300 mb-6">
        Manage your club information, events, and blogs.
      </p>
      {clubs.length === 0 ? (
        <div className="rounded-xl sm:p-9 p-6 transition-shadow duration-300 bg-tilegrey md:w-2/3 lg:w-1/2 flex items-stretch">
            {/* Text section */}
            <button onClick={() => setIsModalOpen(true)}>
                <div className="bg-azul text-white font-bold flex items-center justify-center rounded-md hover:bg-blue-500 h-12 w-12 mr-4">
                    <FaPlus size={20}/>
                </div>
            </button>
            <div className="flex-1">
                <p className="text-gray-300">
                    Have a{" "}
                    <span className="text-white font-semibold">school-affiliated club</span> or{" "}
                    <span className="text-white font-semibold">student group</span>? Create a club page to share it with others!
                </p>
            </div>

        </div>
      ) : (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-full gap-6 p-6" columnClassName="masonry-column">
          {clubs.map((club) => (
            <div key={club.id} className="relative mb-16 break-inside-avoid">
              <Tile 
                clubName={club.name}
                tags={club.tags} 
                links={[]} 
                upvoteCount={club.upvoteCount} 
                isUpvoted={upvotedClubs.includes(club.id)} 
                onUpvoteClick={(e) => handleUpvoteClick(e, club.id)} 
                isUpvoteLoading={isUpvoteLoading[club.id] || false}
                showVoteButton={false}
              />
              {!club.isComplete && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black p-2 rounded-tr-xl rounded-bl-xl flex items-center">
                  <FaExclamationTriangle />
                  <span className="text-sm hidden sm:inline ml-2">Incomplete</span>
                </div>
              )}
              {club.isComplete && (
                <div className="absolute top-0 right-0 bg-green-500 text-black p-2 rounded-tr-xl rounded-bl-xl flex items-center">
                  <FaCheckCircle />
                  <span className="text-sm hidden sm:inline ml-2">Complete</span>
                </div>
              )}
              <button
                onClick={() => router.push(`/edit-club/${club.id}`)}
                className="absolute rounded-br-xl rounded-bl-xl -bottom-8 left-0 right-0 bg-azul text-white p-2 text-center mt-2"
              >
                {club.isComplete ? 'View/Edit Club' : 'Complete Club Info'}
              </button>
            </div>
          ))}
        </Masonry>
      )}

      {/* Floating Create Button */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 bg-azul text-white p-4 rounded-full shadow-lg hover:opacity-80 transition-opacity" aria-label="Create new club">
        <FaPlus size={24} />
      </button>

      {/* Create Club Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Club</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            <input 
              type="text" 
              placeholder="Club Name (Unmodifiable)" 
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

            {/* New Checkboxes */}
            <div className="mb-2 flex items-start space-x-2">
              <input
                type="checkbox"
                checked={agreeSchoolRecognized}
                onChange={() => setAgreeSchoolRecognized(prev => !prev)}
                className="mt-1"
              />
              <label>School-recognized club/student group.</label>
            </div>
            <div className="mb-4 flex items-start space-x-2">
              <input
                type="checkbox"
                checked={agreeAuthorizedBody}
                onChange={() => setAgreeAuthorizedBody(prev => !prev)}
                className="mt-1"
              />
              <label>Authorized student body affirms club page legitimacy.</label>
            </div>

            <button 
              onClick={handleCreateClub} 
              disabled={!agreeSchoolRecognized || !agreeAuthorizedBody}
              className={`w-full p-2 rounded text-white ${(!agreeSchoolRecognized || !agreeAuthorizedBody) ? 'bg-gray-400 cursor-not-allowed' : 'bg-azul hover:bg-blue-600'}`}
            >
              Create Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourClubs;

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { auth, db } from '@/firebase/firebase';
import { or, collection, getDocs, query, where, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile';
import Masonry from 'react-masonry-css';
import { getTodayId, getDailyCode, validateCode } from '@/helpers/codeHelpers';


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
    isVerified: boolean; // Added isVerified property
}

const schoolDistricts = [
    "Wayzata",
    "Minnetonka",
    "Edina",
    "Hopkins",
    "St-Louis-Park",
    "Osseo",
    "Robbinsdale",
    "Anoka-Hennepin"
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
    
    const [verificationCode, setVerificationCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);

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
            const q = query(clubsRef, 
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
                isVerified: doc.data().isVerified || false // Ensure isVerified is included
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
          return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };
        
        const capitalizedClubName = capitalizeFirstWord(newClubName.trim());
        const capitalizedSchool = capitalizeFirstWord(newClubSchool);
        
        if (!capitalizedClubName) {
          setError('Club name is required.');
          return;
        }
        
        if (!verificationCode) {
          setError('Verification code is required.');
          return;
        }
    
        for (const district of schoolDistricts) {
            if (capitalizedClubName.includes(district)) {
              setError(`Please remove the district ${district} from the club name.`);
              return;
            }
        }
        
        if (user) {
          try {
            setCodeLoading(true);
            
            // Validate verification code using codeHelpers
            const todayId = getTodayId();
            const currentCode = await getDailyCode(todayId);
            const { valid } = await validateCode(verificationCode, todayId, currentCode);
    
            if (!valid) {
              setError('Invalid verification code.');
              setCodeLoading(false);
              return;
            }
    
            const newClubRef = collection(db, 'clubs');
            const docId = `${capitalizedClubName.replace(/\s+/g, '-')}-${capitalizedSchool.replace(/\s+/g, '-')}`.toLowerCase();
            
            // Check if the club already exists
            const clubDoc = await getDocs(query(newClubRef, 
                where('name', '==', capitalizedClubName), 
                where('school', '==', capitalizedSchool)
            ));
            
            if (!clubDoc.empty) {
              setError('A club with this name already exists in the selected school district.');
              setCodeLoading(false);
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
            setVerificationCode('');
            setIsModalOpen(false);
            setCodeLoading(false);
            router.push(`/edit-club/${docId}`);
          } catch (error) {
            console.error("Error creating club:", error);
            setError('An error occurred while creating the club. Please try again.');
            setCodeLoading(false);
          }
        }
    };
    
    // Upvote handling functions
    const handleUpvoteClick = async (e: React.MouseEvent<HTMLButtonElement>, clubId: string) => {
        e.stopPropagation(); // Prevent click event from bubbling up
        if (upvotedClubs.includes(clubId)) {
            await handleRemoveUpvote(clubId); // Call remove upvote if already upvoted
        } else {
            await handleUpvoteClub(clubId); // Call upvote function otherwise
        }
    };

    const handleUpvoteClub = async (clubId: string) => {
        if (user) {
            setIsUpvoteLoading(prev => ({ ...prev, [clubId]: true }));
            try {
                await updateDoc(doc(db, 'users', user.uid), { upvotedClubs: arrayUnion(clubId) });
                setUpvotedClubs(prev => [...prev, clubId]);
                
                await updateDoc(doc(db, 'clubs', clubId), { upvoteCount: increment(1) });
                
                // Update local state
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
                
                // Update local state
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
        return null; // Redirect to sign-in or show an appropriate message
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Your Clubs</h1>
            {clubs.length === 0 ? (
                <div className="rounded-xl p-9 transition-shadow duration-300 bg-[#2A2A2A] relative md:w-1/2">
                    <p className="text-gray-300">You haven&apos;t created any clubs yet.<br />Note that only groups that have either <span className='text-white font-semibold'>successfully</span> gone through the student group application process or a club <span className='text-white font-semibold'>affiliated</span> with your school body should create a club.<br /><br /></p>
                    <div className='text-white font-semibold'>CLICK RENDER PAGE TO SEE WHAT IT LOOKS LIKS AND UPLOAD PAGE TO SAVE YOUR CHANGES!</div>
                </div>
            ) : (
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="flex w-full gap-6 p-6"
                    columnClassName="masonry-column"
                >
                    {clubs.map((club) => (
                        <div key={club.id} className="relative mb-16 break-inside-avoid">
                        <Tile 
                            clubName={club.name}
                            tags={club.tags} 
                            links={[]} // Pass links here as needed
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

            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 bg-azul text-white p-4 rounded-full shadow-lg hover:opacity-80 transition-opacity" aria-label="Create new club">
                <FaPlus size={24} />
            </button>

            {/* Modal for creating a new club */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96">
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
                        <input
                            type="text"
                            placeholder="Verification Code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                            maxLength={6}
                        />
                        <button 
                            onClick={handleCreateClub} 
                            className="w-full bg-azul text-white p-2 rounded hover:bg-blue-600"
                            disabled={codeLoading}
                        >
                            {codeLoading ? 'Verifying...' : 'Create Club'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourClubs;

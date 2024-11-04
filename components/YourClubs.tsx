"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/firebase/firebase';
import { collection, getDocs, query, where, serverTimestamp, setDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Tile from '@/components/Tile';

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
            const q = query(clubsRef, where('creatorId', '==', userId));
            const querySnapshot = await getDocs(q);
            const clubsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isComplete: doc.data().isComplete || false,
                tags: doc.data().tags || [],
                upvoteCount: doc.data().upvoteCount || 0
            })) as DashClub[];
            setClubs(clubsData);
        } catch (error) {
            console.error("Error fetching clubs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClub = async () => {
        // Clear previous error messages
        setError('');

        // Validate inputs
        if (!newClubName.trim()) {
            setError('Club name is required.');
            return;
        }
        if (!newClubSchool) {
            setError('Please select a school district.');
            return;
        }

        if (user) {
            try {
                const newClubRef = collection(db, 'clubs');
                const docId = `${newClubName.replace(/\s+/g, '-')}-${newClubSchool.replace(/\s+/g, '-')}`.toLowerCase();
                await setDoc(doc(newClubRef, docId), {
                    id: docId,
                    name: newClubName,
                    school: newClubSchool,
                    creatorId: user.uid,
                    createdAt: serverTimestamp(),
                    creatorName: user.displayName,
                    isComplete: false,
                    tags: [newClubSchool], // Add tags if needed
                    upvoteCount: 0,
                });

                // Clear input fields after successful creation
                setNewClubName('');
                setNewClubSchool('');
                setIsModalOpen(false);
                router.push(`/edit-club/${docId}`)
            } catch (error) {
                console.error("Error creating club:", error);
                setError('An error occurred while creating the club. Please try again.');
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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Your Clubs</h1>
            {clubs.length === 0 ? (
                <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] relative md:w-1/2">
                    <p className="text-gray-300">You haven&apos;t created any clubs yet.<br />Note that only groups that have either <span className='text-white font-semibold'>successfully</span> gone through the student group application process or a club <span className='text-white font-semibold'>affiliated</span> with your school body should create a club.<br /><br /></p>
                    <div className='text-white font-semibold'>CLICK RENDER PAGE TO SEE WHAT IT LOOKS LIKS AND UPLOAD PAGE TO SAVE YOUR CHANGES!</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-16">
                    {clubs.map((club) => (
                        <div key={club.id} className="relative">
                            <Tile 
                                icon="circles.svg" 
                                clubName={club.name} 
                                description={`School: ${club.school}`} 
                                tags={club.tags} 
                                links={[]} // Pass links here as needed
                                upvoteCount={club.upvoteCount} 
                                isUpvoted={upvotedClubs.includes(club.id)} 
                                onUpvoteClick={(e) => handleUpvoteClick(e, club.id)} 
                                isUpvoteLoading={isUpvoteLoading[club.id] || false}
                                showVoteButton={false}
                            />
                            {!club.isComplete && (
                                <div className="absolute top-10 right-0 bg-yellow-500 text-black p-2 rounded-bl-lg rounded-tl-lg flex items-center">
                                    <FaExclamationTriangle />
                                    <span className="text-sm hidden sm:inline ml-2">Incomplete</span> {/* Hidden on small screens */}
                                </div>
                            )}
                            {club.isComplete && (
                                <div className="absolute top-10 right-0 bg-green-500 text-black p-2 rounded-bl-lg rounded-tl-lg flex items-center">
                                    <FaCheckCircle />
                                    <span className="text-sm hidden sm:inline ml-2">Complete</span> {/* Hidden on small screens */}
                                </div>
                            )}
                            <button onClick={() => router.push(`/edit-club/${club.id}`)} className="absolute rounded-br-lg rounded-bl-lg -bottom-9 left-0 right-0 bg-azul text-white p-2 text-center mt-2">
                                {club.isComplete ? 'View/Edit Club' : 'Complete Club Info'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 bg-azul text-white p-4 rounded-full shadow-lg hover:opacity-80 transition-opacity" aria-label="Create new club">
                <FaPlus size={24} />
            </button>

            {/* Modal for creating a new club */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
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
                        <button onClick={handleCreateClub} className="w-full bg-azul text-white p-2 rounded hover:bg-blue-600">
                            Create Club
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourClubs;

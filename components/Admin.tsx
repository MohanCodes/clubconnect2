// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc, collection, getCountFromServer, getDocs } from 'firebase/firestore';
// import { db } from '../../firebase/firebase';
// import Navbar from '@/components/Navbar';
// import { FaUsers, FaClipboardList, FaCalendarAlt, FaCog } from 'react-icons/fa';
// import LoadingModal from '@/components/LoadingModal';

// interface User {
//   id: string;
//   email: string;
//   displayName?: string;
//   isAdmin: boolean;
//   // Add other user properties as needed
// }

// export default function AdminPortal() {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [activeTab, setActiveTab] = useState('users');
//   const [userCount, setUserCount] = useState(0);
//   const [clubCount, setClubCount] = useState(0);
//   const [eventCount, setEventCount] = useState(0);
//   const [users, setUsers] = useState<User[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     const auth = getAuth();
    
//     const checkAdminStatus = async (uid: string) => {
//       try {
//         // Check if user is an admin
//         const userRef = doc(db, 'users', uid);
//         const userSnap = await getDoc(userRef);
        
//         if (!userSnap.exists() || !userSnap.data().isAdmin) {
//           // Not an admin, redirect to dashboard
//           setError('Access denied: You need administrator privileges to view this page');
//           setTimeout(() => {
//             router.push('/dashboard');
//           }, 2000);
//           return false;
//         }
        
//         return true;
//       } catch (error) {
//         console.error('Error checking admin status:', error);
//         setError('An error occurred while verifying your permissions');
//         return false;
//       }
//     };
    
//     const fetchAdminStats = async () => {
//       try {
//         const usersSnap = await getCountFromServer(collection(db, "users"));
//         setUserCount(usersSnap.data().count);

//         const clubsSnap = await getCountFromServer(collection(db, "clubs"));
//         setClubCount(clubsSnap.data().count);

//         setEventCount(93);
//       } catch (error) {
//         setError('Failed to fetch admin stats');
//       }
//     };

//     const fetchUsers = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "users"));
//         const usersList: User[] = []; // Explicit type annotation
//         querySnapshot.forEach((doc) => {
//           usersList.push({
//             id: doc.id,
//             email: doc.data().email,
//             displayName: doc.data().displayName,
//             isAdmin: doc.data().isAdmin
//           });
//         });
//         setUsers(usersList);
//       } catch (err) {
//         setError('Failed to fetch users');
//       }
//     };
    

//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         const isAdmin = await checkAdminStatus(user.uid);
//         if (isAdmin) {
//           await Promise.all([fetchAdminStats(), fetchUsers()]);
//         }
//       } else {
//         router.push('/signin');
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'users':
//         return <UserManagement />;
//       case 'clubs':
//         return <ClubManagement />;
//       case 'events':
//         return <EventManagement />;
//       case 'settings':
//         return <SystemSettings />;
//       default:
//         return <div>Select a tab</div>;
//     }
//   };
  
//   // Placeholder components for tab content
//   const UserManagement = () => (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">User Management</h2>
//       <div className="bg-white rounded-xl shadow p-6">
//         <p className="mb-4">Total users: {userCount}</p>
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map(user => (
//               <tr key={user.id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.displayName || '-'}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{user.isAdmin ? 'Admin' : 'User'}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
//                   <button className="text-red-600 hover:text-red-900">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );  
  
//   const ClubManagement = () => (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Club Management</h2>
//       <div className="bg-white rounded-xl shadow p-6">
//         <p className="mb-4">Total clubs: {clubCount}</p>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {/* Club cards would be populated from database */}
//           <div className="border rounded-xl p-4">
//             <h3 className="text-lg font-medium">Coding Club</h3>
//             <p className="text-gray-500">Members: 24</p>
//             <div className="mt-4 flex justify-end">
//               <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
//               <button className="text-red-600 hover:text-red-900">Delete</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
  
//   const EventManagement = () => (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Event Management</h2>
//       <div className="bg-white rounded-xl shadow p-6">
//         <p className="mb-4">Total events: {eventCount}</p>
//         <div className="space-y-4">
//           {/* Event items would be populated from database */}
//           <div className="border rounded-xl p-4 flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-medium">Spring Hackathon</h3>
//               <p className="text-gray-500">Date: May 15, 2025</p>
//             </div>
//             <div>
//               <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
//               <button className="text-red-600 hover:text-red-900">Delete</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
  
//   const SystemSettings = () => (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">System Settings</h2>
//       <div className="bg-white rounded-xl shadow p-6">
//         <div className="space-y-6">
//           <div>
//             <h3 className="text-lg font-medium mb-2">Email Notifications</h3>
//             <label className="flex items-center">
//               <input type="checkbox" className="form-checkbox h-5 w-5 text-azul" defaultChecked />
//               <span className="ml-2">Enable system notifications</span>
//             </label>
//           </div>
          
//           <div>
//             <h3 className="text-lg font-medium mb-2">Club Creation</h3>
//             <label className="flex items-center">
//               <input type="checkbox" className="form-checkbox h-5 w-5 text-azul" defaultChecked />
//               <span className="ml-2">Require admin approval</span>
//             </label>
//           </div>
          
//           <div>
//             <h3 className="text-lg font-medium mb-2">System Maintenance</h3>
//             <button className="bg-azul text-white py-2 px-4 rounded-md hover:opacity-90">
//               Backup Database
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <LoadingModal loadingMessage='Loading Admin Portal...'/>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-cblack min-h-screen">
//         <Navbar />
//         <main className="flex min-h-screen flex-col items-center justify-center bg-cblack text-white">
//           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 max-w-lg" role="alert">
//             <p>{error}</p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-cblack min-h-screen">
//       <Navbar />
//       <main className="container mx-auto px-4 py-8">
//         <div className="bg-white rounded-xl shadow-xl overflow-hidden">
//           <div className="bg-azul p-6 text-white">
//             <h1 className="text-3xl font-bold">Admin Portal</h1>
//             <p className="mt-2">Manage your MNClubConnect platform</p>
//           </div>
          
//           <div className="p-4">
//             {/* Dashboard Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//               <div className="bg-gray-50 p-4 rounded-xl shadow">
//                 <div className="flex items-center">
//                   <FaUsers className="text-azul text-3xl mr-4" />
//                   <div>
//                     <p className="text-gray-500">Total Users</p>
//                     <p className="text-2xl font-bold">{userCount}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-xl shadow">
//                 <div className="flex items-center">
//                   <FaClipboardList className="text-azul text-3xl mr-4" />
//                   <div>
//                     <p className="text-gray-500">All Clubs</p>
//                     <p className="text-2xl font-bold">{clubCount}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-xl shadow">
//                 <div className="flex items-center">
//                   <FaCalendarAlt className="text-azul text-3xl mr-4" />
//                   <div>
//                     <p className="text-gray-500">Events</p>
//                     <p className="text-2xl font-bold">{eventCount}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Admin Tabs */}
//             <div className="border-b border-gray-200 mb-6">
//               <nav className="flex -mb-px">
//                 <button 
//                   onClick={() => setActiveTab('users')}
//                   className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === 'users' 
//                       ? 'border-azul text-azul' 
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <FaUsers className="inline mr-2" />
//                   Users
//                 </button>
//                 <button 
//                   onClick={() => setActiveTab('clubs')}
//                   className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === 'clubs' 
//                       ? 'border-azul text-azul' 
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <FaClipboardList className="inline mr-2" />
//                   Clubs
//                 </button>
//                 <button 
//                   onClick={() => setActiveTab('events')}
//                   className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === 'events' 
//                       ? 'border-azul text-azul' 
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <FaCalendarAlt className="inline mr-2" />
//                   Events
//                 </button>
//                 <button 
//                   onClick={() => setActiveTab('settings')}
//                   className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
//                     activeTab === 'settings' 
//                       ? 'border-azul text-azul' 
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   <FaCog className="inline mr-2" />
//                   Settings
//                 </button>
//               </nav>
//             </div>
            
//             {/* Tab Content */}
//             <div className="p-4">
//               {renderTabContent()}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
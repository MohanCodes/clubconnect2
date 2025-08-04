// "use client";

// import React, { useState } from 'react';
// import { db } from '@/firebase/firebase';
// import { collection, setDoc, serverTimestamp, doc } from 'firebase/firestore';
// import { FaPlus } from 'react-icons/fa';
// import ReactMarkdown from 'react-markdown'; // Importing React Markdown

// interface ClubInfo {
//   id: string;
//   isComplete: boolean;
//   name: string;
//   school: string;
//   tags: string[];
//   description: string;
//   length: string;
//   meetingTimes: string;
//   meetingSite: string;
//   eligibility: string;
//   costs: string;
//   advisors: { name: string; email: string; }[];
//   studentLeads: { name: string; role: string; email: string; }[];
//   links: { url: string; platform: string; }[];
//   images: string[];
//   creatorId: string;
//   createdAt: any;
//   creatorName: string;
// }

// interface BlogInfo {
//   title: string;
//   date: Date | null;
//   content: string;
// }

// const schoolDistricts = [
//   { name: "Wayzata", colors: ["Blue", "Gold"] },
//   { name: "Minnetonka", colors: ["Blue", "White"] },
//   { name: "Edina", colors: ["Maroon", "Gold"] },
//   { name: "Hopkins", colors: ["Green", "Gold"] },
//   { name: "St. Louis Park", colors: ["Blue", "Yellow"] },
//   { name: "Osseo", colors: ["Blue", "White"] },
//   { name: "Robbinsdale", colors: ["Red", "White"] }
// ];

// const PopulateClubsAndBlogs: React.FC = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [password, setPassword] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
  
//   // Blog state
//   const [blog, setBlog] = useState<BlogInfo>({ title: '', date: null, content: '' });

//   const correctPassword = 'ex'; 

//   const handlePasswordSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (password === correctPassword) {
//       setIsAuthenticated(true);
//     } else {
//       alert('Incorrect password. Please try again.');
//     }
//     setPassword('');
//   };

//   const generateRandomClub = (): Omit<ClubInfo, 'id'> => {
//     const randomString = () => Math.random().toString(36).substring(7);
//     const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

//     const clubTypes = ['Chess', 'Debate', 'Robotics', 'Art', 'Music', 'Sports', 'Science', 'Math', 'Literature', 'Drama'];
//     const district = randomElement(schoolDistricts);
//     const clubType = randomElement(clubTypes);
//     const clubName = `${clubType} Club`;

//     return {
//       isComplete: true,
//       name: clubName,
//       school: district.name,
//       tags: [clubType, 'Education', 'Extracurricular', district.name],
//       description: `This is a ${clubType} club for students in the ${district.name} interested in ${clubType.toLowerCase()}.`,
//       length: `${Math.floor(Math.random() * 3) + 1} hours`,
//       meetingTimes: `Every ${randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])} at ${Math.floor(Math.random() * 12) + 1}:00 PM`,
//       meetingSite: `Room ${Math.floor(Math.random() * 100) + 100}`,
//       eligibility: 'Open to all students in the district',
//       costs: `$${Math.floor(Math.random() * 50)} per semester`,
//       advisors: [{ name: `Dr. ${randomString()}`, email: `advisor${randomString()}@${district.name.toLowerCase().replace(/\s+/g, '')}.edu` }],
//       studentLeads: [{ name: `Student ${randomString()}`, role: 'President', email: `student${randomString()}@${district.name.toLowerCase().replace(/\s+/g, '')}.edu` }],
//       links: [{ url: `https://${randomElement(['twitter', 'instagram', 'facebook', 'linkedin'])}.com/${randomString()}`, platform: randomElement(['twitter', 'instagram', 'facebook', 'linkedin']) }],
//       images: [`https://picsum.photos/200/300?random=${Math.random()}`],
//       creatorId: 'random-generator',
//       createdAt: serverTimestamp(),
//       creatorName: 'Random Generator',
//     };
//   };

//   const populateClubs = async (count:number) => {
//     setIsLoading(true);
//     const clubsRef = collection(db, 'clubs');

//     try {
//       for (let i = 0; i < count; i++) {
//         const randomClub = generateRandomClub();
//         const docId = `${randomClub.name.replace(/\s+/g, '-')}-${randomClub.school.replace(/\s+/g, '-')}`.toLowerCase();
//         await setDoc(doc(clubsRef, docId), randomClub);
//         console.log(`Added club: ${docId}`);
//       }
//       alert(`Successfully added ${count} random clubs!`);
//     } catch (error) {
//       console.error("Error adding random clubs:", error);
//       alert('An error occurred while adding random clubs.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//    // Function to handle blog submission
//    const handleBlogSubmit = async (e : React.FormEvent) => {
//      e.preventDefault();
     
//      // Sanitize the title to create a docId
//      const sanitizedTitle = blog.title
//        .toLowerCase()
//        .replace(/\s+/g, '-') // Replace spaces with dashes
//        .replace(/[^\w-]/g, ''); // Remove special characters

//      const blogsRef = collection(db, 'blogs');

//      try {
//        const docId = sanitizedTitle; // Use the sanitized title as docId
//        await setDoc(doc(blogsRef, docId), { ...blog, createdAt : serverTimestamp() });
//        alert('Blog successfully added!');
//        setBlog({ title : '', date : null, content : '' }); // Reset form
//      } catch (error) {
//        console.error("Error adding blog:", error);
//        alert('An error occurred while adding the blog.');
//      }
//    };

//    return (
//      <div className="p-4">
//        {!isAuthenticated ? (
//          <form onSubmit={handlePasswordSubmit} className="mb-4">
//            <label className="text-white mb-2 block" htmlFor="password">Enter Password:</label>
//            <input
//              type="password"
//              id="password"
//              value={password}
//              onChange={(e) => setPassword(e.target.value)}
//              className="bg-gray-800 text-white p-2 rounded mb-4"
//              required
//            />
//            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//              Submit
//            </button>
//          </form>
//        ) : (
//          <>
//            <h1 className="text-2xl font-bold mb-4">Random Club Generator</h1>
//            <button
//              onClick={() => populateClubs(10)}
//              disabled={isLoading}
//              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
//            >
//              {isLoading ? (
//                <span>Generating...</span>
//              ) : (
//                <>
//                  <FaPlus className="mr-2" />
//                  <span>Generate Random Clubs</span>
//                </>
//              )}
//            </button>

//            {/* Blog Section */}
//            <h2 className="text-xl font-bold mt-8">Create a Blog Post</h2>
//            <form onSubmit={handleBlogSubmit} className="mt-4">
//              <input
//                type="text"
//                placeholder="Blog Title"
//                value={blog.title}
//                onChange={(e) => setBlog({ ...blog, title : e.target.value })}
//                className="bg-gray-800 text-white p-2 rounded mb-2 w-full"
//                required
//              />
//              <input
//                type="date"
//                value={blog.date ? blog.date.toISOString().substring(0,10) : ''}
//                onChange={(e) => setBlog({ ...blog, date : new Date(e.target.value) })}
//                className="bg-gray-800 text-white p-2 rounded mb-2 w-full"
//              />
//              <textarea
//                placeholder="Write your blog content here..."
//                value={blog.content}
//                onChange={(e) => setBlog({ ...blog, content : e.target.value })}
//                className="bg-gray-800 text-white p-2 rounded mb-2 w-full h-40"
//                required
//              />
//              <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
//                Publish Blog
//              </button>
//            </form>

//            {/* Displaying Blog Content Preview */}
//            {blog.content && (
//              <div className="mt-6">
//                <h3 className="text-lg font-bold">Preview:</h3>
//                <ReactMarkdown>{blog.content}</ReactMarkdown>
//              </div>
//            )}
//          </>
//        )}
//      </div>
//    );
// };

// export default PopulateClubsAndBlogs;
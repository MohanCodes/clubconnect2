/*"use client";

import React, { useState } from 'react';
import { db } from '@/firebase/firebase';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FaPlus } from 'react-icons/fa';

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
  advisors: { name: string; email: string; }[];
  studentLeads: { name: string; role: string; email: string; }[];
  links: { url: string; platform: string; }[];
  images: string[];
  creatorId: string;
  createdAt: any;
  creatorName: string;
}

const schoolDistricts = [
  { name: "Wayzata", colors: ["Blue", "Gold"] },
  { name: "Minnetonka", colors: ["Blue", "White"] },
  { name: "Edina", colors: ["Maroon", "Gold"] },
  { name: "Hopkins", colors: ["Green", "Gold"] },
  { name: "St. Louis Park", colors: ["Blue", "Yellow"] },
  { name: "Osseo", colors: ["Blue", "White"] },
  { name: "Robbinsdale", colors: ["Red", "White"] },
  { name: "Anoka-Hennepin", colors: ["Blue", "Gold"] }
];

const PopulateClubs: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateRandomClub = (): Omit<ClubInfo, 'id'> => {
    const randomString = () => Math.random().toString(36).substring(7);
    const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const clubTypes = ['Chess', 'Debate', 'Robotics', 'Art', 'Music', 'Sports', 'Science', 'Math', 'Literature', 'Drama'];
    const platforms = ['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'discord', 'github', 'tiktok', 'website'];

    const district = randomElement(schoolDistricts);
    const clubType = randomElement(clubTypes);
    const clubName = `${clubType} Club`;

    return {
      isComplete: true,
      name: clubName,
      school: district.name,
      tags: [clubType, 'Education', 'Extracurricular', district.name],
      description: `This is a ${clubType} club for students in the ${district.name} interested in ${clubType.toLowerCase()}.`,
      length: `${Math.floor(Math.random() * 3) + 1} hours`,
      meetingTimes: `Every ${randomElement(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])} at ${Math.floor(Math.random() * 12) + 1}:00 PM`,
      meetingSite: `Room ${Math.floor(Math.random() * 100) + 100}`,
      eligibility: 'Open to all students in the district',
      costs: `$${Math.floor(Math.random() * 50)} per semester`,
      advisors: [{ name: `Dr. ${randomString()}`, email: `advisor${randomString()}@${district.name.toLowerCase().replace(/\s+/g, '')}.edu` }],
      studentLeads: [{ name: `Student ${randomString()}`, role: 'President', email: `student${randomString()}@${district.name.toLowerCase().replace(/\s+/g, '')}.edu` }],
      links: [{ url: `https://${randomElement(platforms)}.com/${randomString()}`, platform: randomElement(platforms) }],
      images: [`https://picsum.photos/200/300?random=${Math.random()}`],
      creatorId: 'random-generator',
      createdAt: serverTimestamp(),
      creatorName: 'Random Generator',
    };
  };

  const populateClubs = async (count: number) => {
    setIsLoading(true);
    const clubsRef = collection(db, 'clubs');

    try {
      for (let i = 0; i < count; i++) {
        const randomClub = generateRandomClub();
        const docId = `${randomClub.name.replace(/\s+/g, '-')}-${randomClub.school.replace(/\s+/g, '-')}`.toLowerCase();
        await setDoc(doc(clubsRef, docId), randomClub);
        console.log(`Added club: ${docId}`);
      }
      alert(`Successfully added ${count} random clubs!`);
    } catch (error) {
      console.error("Error adding random clubs:", error);
      alert('An error occurred while adding random clubs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Random Club Generator</h1>
      <button
        onClick={() => populateClubs(1)}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
      >
        {isLoading ? (
          <span>Generating...</span>
        ) : (
          <>
            <FaPlus className="mr-2" />
            <span>Generate 10 Random Clubs</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PopulateClubs;
*/
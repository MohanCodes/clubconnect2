'use client';

import React, { useState, useEffect } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import { db, auth } from '@/firebase/firebase'; // ✅ Make sure auth is exported from your firebase config
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { jsPDF } from 'jspdf';

interface UserProfile {
  id: string;
  displayName: string;
  name?: string;
  email: string;
  photoURL?: string;
  role?: 'member' | 'editor';
  phone?: string;
  gradeLevel?: string;
  major?: string;
  notifications?: {
    email: boolean;
    meetingReminders: boolean;
    eventAnnouncements: boolean;
    clubInvitations: boolean;
    weeklyDigest: boolean;
  };
  privacy?: {
    profileVisible: boolean;
    showClubMembership: boolean;
    allowContact: boolean;
  };
}

interface ClubData {
  id: string;
  name: string;
  school: string;
}

interface FirestoreUserData extends Partial<UserProfile> {
  upvotedClubs?: string[];
}

export function DataExportButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as FirestoreUserData;
          setProfile({
            id: user.uid,
            displayName: data.displayName || user.displayName || '',
            name: data.name,
            email: data.email || user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
            role: data.role || 'member',
            phone: data.phone,
            gradeLevel: data.gradeLevel,
            major: data.major,
            notifications: data.notifications,
            privacy: data.privacy
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStarredClubs = async (upvotedClubIds: string[]): Promise<ClubData[]> => {
    if (!upvotedClubIds.length) return [];
    try {
      const clubsData = await Promise.all(
        upvotedClubIds.map(async (clubId) => {
          const clubDocSnap = await getDoc(doc(db, 'clubs', clubId));
          if (clubDocSnap.exists()) {
            const data = clubDocSnap.data() as { name?: string; school?: string };
            return {
              id: clubId,
              name: data.name || 'Unknown Club',
              school: data.school || 'Unknown School'
            };
          }
          return null;
        })
      );
      return clubsData.filter((c): c is ClubData => c !== null);
    } catch (err) {
      console.error('Error fetching starred clubs:', err);
      return [];
    }
  };

  const fetchCreatedClubs = async (userId: string): Promise<ClubData[]> => {
    try {
      const clubsQuery = query(collection(db, 'clubs'), where('creatorId', '==', userId));
      const snapshot = await getDocs(clubsQuery);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as { name?: string; school?: string };
        return {
          id: docSnap.id,
          name: data.name || 'Unknown Club',
          school: data.school || 'Unknown School'
        };
      });
    } catch (err) {
      console.error('Error fetching created clubs:', err);
      return [];
    }
  };

  const generatePDF = async () => {
    if (!firebaseUser || !profile) {
      alert('No logged in user found.');
      return;
    }

    setIsGenerating(true);

    try {
      const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDocSnap.exists() ? (userDocSnap.data() as FirestoreUserData) : {};
      const upvotedClubIds = userData.upvotedClubs || [];

      const [starredClubs, createdClubs] = await Promise.all([
        fetchStarredClubs(upvotedClubIds),
        fetchCreatedClubs(firebaseUser.uid)
      ]);

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      const lineHeight = 7;
      const margin = 20;

      const addText = (text: string, fontSize = 12, bold = false) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPos);
        yPos += lines.length * lineHeight + 3;
      };

      const addSection = (title: string, content: string) => {
        addText(title, 14, true);
        addText(content, 11, false);
        yPos += 5;
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personal Data Export', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Date
      addText(`Generated on: ${new Date().toLocaleString('en-US')}`, 10);
      yPos += 10;

      // Profile Information
      addSection('PROFILE INFORMATION', '');
      addSection('Full Name:', profile.displayName || profile.name || 'Not provided');
      addSection('Email Address:', profile.email || 'Not provided');
      addSection('User ID:', profile.id || 'Not provided');
      addSection('Role:', profile.role || 'Not provided');
      addSection('Phone Number:', profile.phone || 'Not provided');
      addSection('Grade Level:', profile.gradeLevel || 'Not provided');
      addSection('Major:', profile.major || 'Not provided');
      addSection('Profile Picture:', profile.photoURL ? `Yes (URL: ${profile.photoURL})` : 'No');

      // Starred Clubs
      yPos += 5;
      addSection('STARRED CLUBS', '');
      if (starredClubs.length) {
        starredClubs.forEach((club, i) => {
          addText(`${i + 1}. ${club.name}`, 11);
          addText(`   School: ${club.school}`, 10);
          addText(`   Club ID: ${club.id}`, 10);
          yPos += 2;
        });
      } else {
        addText('No starred clubs found', 11);
      }

      // Created Clubs
      yPos += 5;
      addSection('CLUBS YOU CREATED', '');
      if (createdClubs.length) {
        createdClubs.forEach((club, i) => {
          addText(`${i + 1}. ${club.name}`, 11);
          addText(`   School: ${club.school}`, 10);
          addText(`   Club ID: ${club.id}`, 10);
          yPos += 2;
        });
      } else {
        addText('No clubs created by you found', 11);
      }

      // Notification Preferences
      yPos += 5;
      addSection('NOTIFICATION PREFERENCES', '');
      if (profile.notifications) {
        addSection('Email Notifications:', profile.notifications.email ? 'Enabled' : 'Disabled');
        addSection('Meeting Reminders:', profile.notifications.meetingReminders ? 'Enabled' : 'Disabled');
        addSection('Event Announcements:', profile.notifications.eventAnnouncements ? 'Enabled' : 'Disabled');
        addSection('Club Invitations:', profile.notifications.clubInvitations ? 'Enabled' : 'Disabled');
        addSection('Weekly Digest:', profile.notifications.weeklyDigest ? 'Enabled' : 'Disabled');
      } else {
        addText('No notification preferences set', 11);
      }

      // Privacy Settings
      yPos += 5;
      addSection('PRIVACY SETTINGS', '');
      if (profile.privacy) {
        addSection('Profile Visibility:', profile.privacy.profileVisible ? 'Visible to others' : 'Private');
        addSection('Show Club Membership:', profile.privacy.showClubMembership ? 'Yes' : 'No');
        addSection('Allow Contact:', profile.privacy.allowContact ? 'Yes' : 'No');
      } else {
        addText('No privacy settings configured', 11);
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.text(
        'This document contains your personal data as stored in our system.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      pdf.save(`personal-data-export-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={isGenerating || !firebaseUser}
      className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
          Generating PDF...
        </>
      ) : (
        <>
          <FaDownload className="-ml-1 mr-2 h-5 w-5 text-gray-300" />
          Download
        </>
      )}
    </button>
  );
};

export default DataExportButton;
